import { PrismaService } from '../../../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';
import moment from 'moment-timezone';

export async function findOneRepairDistrict(prisma: PrismaService, id: number) {
  const repairdistrict = await prisma.repairDistrict.findUnique({
    where: { id },
    include: {
      branch: {
        select: {
          id: true,
          name: true,
          code: true,
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
  if (!repairdistrict) throw new NotFoundException('repairdistrict not found');
  return {
    ...repairdistrict,
    createdAt: moment(repairdistrict.createdAt).tz('Asia/Vientiane').format(),
    updatedAt: moment(repairdistrict.updatedAt).tz('Asia/Vientiane').format(),
  };
}
