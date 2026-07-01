import { PrismaService } from '../../../prisma/prisma.service';
import moment from 'moment-timezone';

export interface EdlAppGetOptions {
  page?: number;
  limit?: number;
}

export async function edlAppGet(
  prisma: PrismaService,
  externalUserId: number,
  topicId: number,
  options: EdlAppGetOptions = {},
) {
  const page = options.page ? Number(options.page) : 1;
  const limit = options.limit ? Number(options.limit) : 15;
  const skip = (page - 1) * limit;
  const take = limit;

  let conversation = await prisma.conversation.findUnique({
    where: {
      externalUserId_topicId: {
        externalUserId,
        topicId,
      },
    },
  });

  if (!conversation) {
    return [];
  }

  // Reset unreadExternalCount and mark call center messages as seen
  await prisma.$transaction(async (tx) => {
    await tx.conversation.update({
      where: { id: conversation.id },
      data: {
        unreadExternalCount: 0,
      },
    });

    await tx.message.updateMany({
      where: {
        conversationId: conversation.id,
        senderType: 'callcenter',
        status: { not: 'seen' },
      },
      data: {
        status: 'seen',
        seenAt: new Date(),
      },
    });
  });

  const messages = await prisma.message.findMany({
    where: {
      conversationId: conversation.id,
    },
    orderBy: {
      createdAt: 'desc',
    },
    skip,
    take,
    include: {
      edlappUser: {
        select: {
          id: true,
          name: true,
        },
      },
      agentUser: {
        select: {
          id: true,
          employee: {
            select: {
              first_name: true,
              last_name: true,
            },
          },
        },
      },
    },
  });

  return messages.map((message) => {
    return {
      ...message,
      createdAt: moment(message.createdAt).tz('Asia/Vientiane').format(),
      updatedAt: moment(message.updatedAt).tz('Asia/Vientiane').format(),
    };
  });
}
