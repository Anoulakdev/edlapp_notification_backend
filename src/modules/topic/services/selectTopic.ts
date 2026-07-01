import { PrismaService } from '../../../prisma/prisma.service';

export async function selectTopic(prisma: PrismaService) {
  return prisma.topic.findMany({
    where: {
      actived: true,
    },
    orderBy: {
      id: 'asc',
    },
    select: {
      id: true,
      name: true,
    },
  });
}
