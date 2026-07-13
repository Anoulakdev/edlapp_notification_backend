import { PrismaService } from '../../../prisma/prisma.service';
import { CreateConversationDto } from '../dto/create-conversation.dto';
import { AuthUser } from '../../../interfaces/auth-user.interface';
import * as fs from 'fs';
import * as path from 'path';
import axios from 'axios';
import { sendFCM } from '../../../fcm/fcm.service';

/**
 * Helper function to delete uploaded files on transaction failure
 */
async function deleteUploadedFile(filename?: string) {
  if (!filename) return;

  const filePath = path.resolve(
    process.env.UPLOAD_BASE_PATH || '',
    'conversation',
    filename,
  );

  try {
    await fs.promises.access(filePath, fs.constants.F_OK);
    await fs.promises.unlink(filePath);
  } catch (err) {
    console.error(`Error deleting uploaded file at ${filePath}:`, err);
  }
}

export async function callCreate(
  prisma: PrismaService,
  user: AuthUser,
  createConversationDto: CreateConversationDto,
) {
  let { externalUserId, topicId, content, fileImg, fileAudio, lat, lng } =
    createConversationDto;

  let fcmTokens: string[] = [];
  if (externalUserId) {
    try {
      const response = await axios.get(
        `${process.env.EDLAPP_URL_API}/getUserById/${externalUserId}`,
        {
          headers: {
            'x-api-key': process.env.API_KEY,
          },
        },
      );

      const apiUserData = response.data?.data;
      const tokenSet = new Set<string>();

      if (apiUserData) {
        if (Array.isArray(apiUserData)) {
          apiUserData.forEach((u: any) => {
            const token = u.access_noti ? String(u.access_noti).trim() : '';
            if (
              token !== '' &&
              token.toLowerCase() !== 'demo' &&
              token.toLowerCase() !== 'null' &&
              token.toLowerCase() !== 'undefined'
            ) {
              tokenSet.add(token);
            }
          });
        } else {
          const token = apiUserData.access_noti
            ? String(apiUserData.access_noti).trim()
            : '';
          if (
            token !== '' &&
            token.toLowerCase() !== 'demo' &&
            token.toLowerCase() !== 'null' &&
            token.toLowerCase() !== 'undefined'
          ) {
            tokenSet.add(token);
          }
        }
      }

      fcmTokens = Array.from(tokenSet);
    } catch (error) {
      console.error('Failed to fetch user FCM token from external API:', error);
      // Fallback gracefully: do not throw to avoid blocking the message delivery!
    }
  }

  let topicName = String(topicId);
  let result: any;

  try {
    result = await prisma.$transaction(async (tx) => {
      const topicObj = await tx.topic.findUnique({
        where: { id: topicId },
        select: { name: true },
      });
      if (topicObj) {
        topicName = topicObj.name;
      }

      let lastMessage = '';
      let mType = 'text';
      if (content) {
        mType = 'text';
        lastMessage = content || '';
      } else if (fileImg) {
        mType = 'image';
        lastMessage = '[ຮູບພາບ]';
      } else if (fileAudio) {
        mType = 'audio';
        lastMessage = '[ຟາຍສຽງ]';
      } else if (lat && lng) {
        mType = 'location';
        lastMessage = '[ຕຳແໜ່ງ]';
      }

      let conversation = await tx.conversation.findUnique({
        where: {
          externalUserId_topicId: {
            externalUserId,
            topicId,
          },
        },
      });

      if (conversation) {
        conversation = await tx.conversation.update({
          where: { id: conversation.id },
          data: {
            lastMessage,
            lastMessageAt: new Date(),
            unreadExternalCount: { increment: 1 },
          },
        });
      } else {
        conversation = await tx.conversation.create({
          data: {
            externalUserId,
            topicId,
            lastMessage,
            lastMessageAt: new Date(),
            unreadExternalCount: 1,
            unreadAgentCount: 0,
          },
        });
      }

      const parsedLat = lat !== undefined && lat !== null ? Number(lat) : null;
      const parsedLng = lng !== undefined && lng !== null ? Number(lng) : null;

      await tx.message.create({
        data: {
          conversationId: conversation.id,
          senderType: 'callcenter',
          agentId: user.id,
          mType: mType as any,
          content: content || null,
          fileImg: fileImg || null,
          fileAudio: fileAudio || null,
          lat: parsedLat,
          lng: parsedLng,
        },
      });

      return conversation;
    });
  } catch (error) {
    // Clean up uploaded files in case of database insertion error
    await deleteUploadedFile(fileImg);
    await deleteUploadedFile(fileAudio);
    throw error;
  }

  if (fcmTokens.length) {
    sendFCM(
      fcmTokens,
      `ທ່ານມີຂໍ້ຄວາມຈາກ ສູນບໍລິການລູກຄ້າ EDL`,
      `ຫົວຂໍ້ "${topicName}"`,
      {
        topicId: String(topicId),
      },
    ).catch((fcmError) => {
      console.error(
        'Failed to send FCM notifications in background:',
        fcmError,
      );
    });
  }

  return result;
}
