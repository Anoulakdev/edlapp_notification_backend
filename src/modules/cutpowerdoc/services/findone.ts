import { PrismaService } from '../../../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';
import moment from 'moment-timezone';

export async function findOneCutpowerDoc(prisma: PrismaService, id: number) {
  const cutpower = await prisma.cutpowerDoc.findUnique({
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
      province: true,
      district: true,
      cutpowerAddresses: {
        select: {
          id: true,
          village: true,
        },
      },
      cutpowerAssigns: true,
    },
  });
  if (!cutpower) throw new NotFoundException('cutpower not found');
  return {
    ...cutpower,
    cutpowerDate: moment(cutpower.cutpowerDate)
      .tz('Asia/Vientiane')
      .format('YYYY-MM-DD'),
    createdAt: moment(cutpower.createdAt).tz('Asia/Vientiane').format(),
    updatedAt: moment(cutpower.updatedAt).tz('Asia/Vientiane').format(),
  };
}
