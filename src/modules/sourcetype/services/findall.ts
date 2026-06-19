import { PrismaService } from '../../../prisma/prisma.service';

export async function findAllSourceType(prisma: PrismaService) {
  return prisma.sourceType.findMany({
    orderBy: {
      id: 'asc',
    },
  });
}
