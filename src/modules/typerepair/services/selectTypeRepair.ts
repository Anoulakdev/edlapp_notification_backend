import { PrismaService } from '../../../prisma/prisma.service';

export async function selectTypeRepair(prisma: PrismaService) {
  return prisma.typeRepair.findMany({
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
