import { PrismaService } from '../../../prisma/prisma.service';

export async function selectEquipment(
  prisma: PrismaService,
  typeEquipmentId?: number,
) {
  const where = typeEquipmentId
    ? { typeEquipmentId: Number(typeEquipmentId) }
    : undefined;

  return prisma.equipment.findMany({
    where: {
      actived: true,
      ...where,
    },
    orderBy: {
      id: 'asc',
    },
    select: {
      id: true,
      name: true,
      typeEquipmentId: true,
      typeEquipment: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });
}
