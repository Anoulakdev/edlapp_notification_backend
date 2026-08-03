import { PrismaService } from '../../../prisma/prisma.service';
import moment from 'moment-timezone';

export async function listByTopic(
  prisma: PrismaService,
  topicId: number,
  isHistory?: boolean,
) {
  const where: any = {
    topicId,
  };

  if (!isHistory) {
    where.deletedAt = null;
  }

  const conversations = await prisma.conversation.findMany({
    where,
    include: {
      externalUser: {
        select: {
          id: true,
          name: true,
          tel: true,
        },
      },
    },
    orderBy: {
      lastMessageAt: 'desc',
    },
  });

  return conversations.map((conv) => {
    return {
      ...conv,
      lastMessageAt: conv.lastMessageAt
        ? moment(conv.lastMessageAt).tz('Asia/Vientiane').format()
        : null,
      createdAt: moment(conv.createdAt).tz('Asia/Vientiane').format(),
      updatedAt: moment(conv.updatedAt).tz('Asia/Vientiane').format(),
    };
  });
}
