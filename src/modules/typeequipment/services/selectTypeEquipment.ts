import { PrismaService } from '../../../prisma/prisma.service';

export async function selectTypeEquipment(prisma: PrismaService) {
  return prisma.typeEquipment.findMany({
    where: {
      actived: true,
    },
    orderBy: {
      id: 'asc',
    },
    select: {
      id: true,
      name: true,
      code: true,
    },
  });
}
