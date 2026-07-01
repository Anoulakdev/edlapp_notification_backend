import { PrismaService } from '../../../prisma/prisma.service';

export async function selectStatus(prisma: PrismaService) {
  return prisma.meterStatus.findMany({
    orderBy: {
      id: 'asc',
    },
  });
}
