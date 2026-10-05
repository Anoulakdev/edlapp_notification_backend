import { PrismaService } from '../../../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';

export async function findOneTypeEquipment(prisma: PrismaService, id: number) {
  const typeEquipment = await prisma.typeEquipment.findUnique({
    where: { id },
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
    },
  });
  if (!typeEquipment) throw new NotFoundException('type equipment not found');
  return typeEquipment;
}
