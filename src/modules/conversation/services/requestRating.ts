import { PrismaService } from '../../../prisma/prisma.service';
import { AuthUser } from '../../../interfaces/auth-user.interface';
import { RequestRatingDto } from '../dto/request-rating.dto';
import { NotFoundException } from '@nestjs/common';
import axios from 'axios';
import { sendFCM } from '../../../fcm/fcm.service';

export async function requestRating(
  prisma: PrismaService,
  user: AuthUser,
  dto: RequestRatingDto,
) {
  const conversation = await prisma.conversation.findUnique({
    where: { id: dto.conversationId },
    include: { externalUser: true, topic: true },
  });

  if (!conversation) {
    throw new NotFoundException('Conversation not found');
  }

  // 1. Fetch user FCM tokens from EDLAPP API (same logic as callCreate)
  let fcmTokens: string[] = [];
  if (conversation.externalUserId) {
    try {
      const response = await axios.get(
        `${process.env.EDLAPP_URL_API}/getUserById/${conversation.externalUserId}`,
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
      console.error(
        'Failed to fetch user FCM token for rating request:',
        error,
      );
    }
  }

  // 2. Create a rating request message in the conversation
  const message = await prisma.message.create({
    data: {
      conversationId: conversation.id,
      senderType: 'callcenter',
      agentId: user.id,
      mType: 'text',
      content: 'ຂໍລົບກວນໃຫ້ດາວປະເມິນຄວາມພຶງພໍໃຈໃນການບໍລິການ',
      status: 'sent',
    },
  });

  // 3. Update conversation last message
  await prisma.conversation.update({
    where: { id: conversation.id },
    data: {
      lastMessage: message.content,
      lastMessageAt: message.createdAt,
      unreadExternalCount: { increment: 1 },
    },
  });

  // 4. Send FCM Push Notification to edlapp app
  if (fcmTokens.length) {
    const topicName = conversation.topic?.name || 'ທົ່ວໄປ';
    sendFCM(
      fcmTokens,
      `ຂໍຮ້ອງປະເມິນຄວາມພຶງພໍໃຈໃນການບໍລິການ`,
      `ຈາກ ສູນບໍລິການລູກຄ້າ EDL (ຫົວຂໍ້ "${topicName}")`,
      {
        topicId: String(conversation.topicId),
        conversationId: String(conversation.id),
        messageId: String(message.id),
        agentId: String(user.id),
        type: 'rating_request',
      },
    ).catch((fcmError) => {
      console.error(
        'Failed to send FCM notification for rating request:',
        fcmError,
      );
    });
  }

  return {
    conversation,
    message,
    agent: {
      id: user.id,
      username: user.username,
    },
  };
}
