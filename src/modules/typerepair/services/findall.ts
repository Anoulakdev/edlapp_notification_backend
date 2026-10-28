import { PrismaService } from '../../../prisma/prisma.service';

export async function findAllTypeRepair(prisma: PrismaService) {
  return prisma.typeRepair.findMany({
    orderBy: {
      id: 'asc',
    },
  });
}
