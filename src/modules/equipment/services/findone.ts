import { PrismaService } from '../../../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';

export async function findOneEquipment(prisma: PrismaService, id: number) {
  const equipment = await prisma.equipment.findUnique({
    where: { id },
    include: {
      typeEquipment: {
        select: {
          id: true,
          name: true,
          code: true,
          actived: true,
        },
      },
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
  if (!equipment) throw new NotFoundException('equipment not found');
  return equipment;
}
