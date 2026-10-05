import { PrismaService } from '../../../prisma/prisma.service';

export async function findAllEquipment(prisma: PrismaService) {
  return prisma.equipment.findMany({
    orderBy: {
      id: 'asc',
    },
    include: {
      typeEquipment: true,
      createdBy: {
        select: {
          id: true,
          employee: {
            select: {
              id: true,
              first_name: true,
              last_name: true,
              gender: true,
              emp_code: true,
            },
          },
        },
      },
    },
  });
}
