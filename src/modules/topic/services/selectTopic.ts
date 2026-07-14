import { PrismaService } from '../../../prisma/prisma.service';

export async function selectTopic(prisma: PrismaService) {
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
      description: true,
      conversations: {
        select: {
          unreadAgentCount: true,
        },
      },
    },
  });

  return topics.map((t) => {
    const unreadCount = t.conversations.reduce(
      (sum, c) => sum + (c.unreadAgentCount || 0),
      0,
    );
    return {
      id: t.id,
      name: t.name,
      description: t.description,
      unreadCount,
    };
  });
}
