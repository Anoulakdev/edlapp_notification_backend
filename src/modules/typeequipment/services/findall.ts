import { PrismaService } from '../../../prisma/prisma.service';

export async function findAllTypeEquipment(prisma: PrismaService) {
  return prisma.typeEquipment.findMany({
    orderBy: {
      id: 'asc',
    },
    include: {
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
      equipments: {
        orderBy: {
          id: 'desc',
        },
        take: 1,
        select: {
          id: true,
        },
      },
    },
  });
}
