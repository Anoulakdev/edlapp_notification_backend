import { PrismaService } from '../../../prisma/prisma.service';

export async function findAllTurnoffStatus(prisma: PrismaService) {
  return prisma.turnoffStatus.findMany({
    orderBy: {
      id: 'asc',
    },
  });
}
