import { PrismaService } from '../../../prisma/prisma.service';

export async function edlappTopic(prisma: PrismaService, userAppId: number) {
  const topics = await prisma.topic.findMany({
    where: {
      actived: true,
    },
    orderBy: {
      id: 'asc',
    },
    select: {
      id: true,
      name: true,
      conversations: {
        where: {
          externalUserId: Number(userAppId),
        },
        select: {
          unreadExternalCount: true,
        },
      },
    },
  });

  return topics.map((t) => {
    const unreadCount = t.conversations.reduce(
      (sum, c) => sum + (c.unreadExternalCount || 0),
      0,
    );
    return {
      id: t.id,
      name: t.name,
      unreadCount,
    };
  });
}
