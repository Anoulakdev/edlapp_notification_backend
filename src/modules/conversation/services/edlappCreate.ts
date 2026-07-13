import { PrismaService } from '../../../prisma/prisma.service';
import { CreateConversationDto } from '../dto/create-conversation.dto';
import * as fs from 'fs';
import * as path from 'path';
import axios from 'axios';

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

export async function edlAppCreate(
  prisma: PrismaService,
  createConversationDto: CreateConversationDto,
) {
  let { externalUserId, topicId, content, fileImg, fileAudio, lat, lng } =
    createConversationDto;

  try {
    // 1. Fetch user data from EDLAPP API
    let name = '';
    let tel = '';

    try {
      const response = await axios.get(
        `${process.env.EDLAPP_URL_API}/getUserById/${externalUserId}`,
        {
          headers: {
            'x-api-key': process.env.API_KEY,
          },
        },
      );
      if (response.data?.data) {
        name = response.data.data.username || '';
        tel = response.data.data.phone_no || '';
      }
    } catch (error) {
      console.error(
        `Failed to fetch external user by ID ${externalUserId}:`,
        error instanceof Error ? error.message : error,
      );
    }

    // 2. Perform Transaction
    return await prisma.$transaction(async (tx) => {
      // 2.1 Fetch existing user if any, to apply fallback: name = response.data.data.username || name
      const existingUser = await tx.externalUser.findUnique({
        where: { id: externalUserId },
      });

      const finalName = name || existingUser?.name || '';
      const finalTel = tel || existingUser?.tel || '';

      // 2.2 Upsert ExternalUser
      await tx.externalUser.upsert({
        where: { id: externalUserId },
        update: {
          name: finalName,
          tel: finalTel,
        },
        create: {
          id: externalUserId,
          name: finalName,
          tel: finalTel,
        },
      });

      // 2.3 Determine preview fields for conversation
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

      // 2.4 Find or Create Conversation
      let conversation = await tx.conversation.findUnique({
        where: {
          externalUserId_topicId: {
            externalUserId,
            topicId,
          },
        },
      });

      if (conversation) {
        // If conversation already exists, update preview fields and increment agent unread count
        conversation = await tx.conversation.update({
          where: { id: conversation.id },
          data: {
            lastMessage,
            lastMessageAt: new Date(),
            unreadAgentCount: { increment: 1 },
          },
        });
      } else {
        // If it doesn't exist, create a new one
        conversation = await tx.conversation.create({
          data: {
            externalUserId,
            topicId,
            lastMessage,
            lastMessageAt: new Date(),
            unreadExternalCount: 0,
            unreadAgentCount: 1,
          },
        });
      }

      const parsedLat = lat !== undefined && lat !== null ? Number(lat) : null;
      const parsedLng = lng !== undefined && lng !== null ? Number(lng) : null;

      await tx.message.create({
        data: {
          conversationId: conversation.id,
          senderType: 'edlapp',
          edlappId: externalUserId,
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
}
