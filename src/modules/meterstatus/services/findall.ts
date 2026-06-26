import { PrismaService } from '../../../prisma/prisma.service';

export async function findAllMeterstatus(prisma: PrismaService) {
  return prisma.meterStatus.findMany({
    orderBy: {
      id: 'asc',
    },
  });
}
