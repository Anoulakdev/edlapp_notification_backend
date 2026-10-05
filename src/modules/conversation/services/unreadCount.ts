import { PrismaService } from '../../../prisma/prisma.service';

export async function unreadCount(prisma: PrismaService) {
  const result = await prisma.conversation.aggregate({
    _sum: {
      unreadAgentCount: true,
    },
    where: {
      deletedAt: null,
      topic: {
        actived: true,
      },
    },
  });

  const total = result._sum.unreadAgentCount || 0;

  return {
    total,
  };
}
