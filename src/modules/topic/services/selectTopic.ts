import { PrismaService } from '../../../prisma/prisma.service';

export async function selectTopic(prisma: PrismaService) {
  const [topics, unreadAggregations] = await Promise.all([
    prisma.topic.findMany({
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
      },
    }),
    prisma.conversation.groupBy({
      by: ['topicId'],
      where: {
        deletedAt: null,
      },
      _sum: {
        unreadAgentCount: true,
      },
    }),
  ]);

  const unreadMap = new Map<number, number>();
  for (const item of unreadAggregations) {
    if (item.topicId != null) {
      unreadMap.set(item.topicId, item._sum.unreadAgentCount || 0);
    }
  }

  return topics.map((t) => ({
    id: t.id,
    name: t.name,
    description: t.description,
    unreadCount: unreadMap.get(t.id) || 0,
  }));
}
