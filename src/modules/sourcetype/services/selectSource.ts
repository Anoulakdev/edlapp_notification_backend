import { PrismaService } from '../../../prisma/prisma.service';

export async function selectSource(prisma: PrismaService) {
  return prisma.sourceType.findMany({
    orderBy: {
      id: 'asc',
    },
  });
}
