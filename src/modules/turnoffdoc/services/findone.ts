import { PrismaService } from '../../../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';
import moment from 'moment-timezone';

export async function findOneTurnoffDoc(prisma: PrismaService, id: number) {
  const turnoff = await prisma.turnoffDoc.findUnique({
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
      turnoffAddresses: {
        select: {
          id: true,
          village: true,
        },
      },
      turnoffAssigns: true,
    },
  });
  if (!turnoff) throw new NotFoundException('turnoff not found');
  return {
    ...turnoff,
    startDate: moment(turnoff.startDate).format('YYYY-MM-DD'),
    endDate: moment(turnoff.endDate).format('YYYY-MM-DD'),
    createdAt: moment(turnoff.createdAt).tz('Asia/Vientiane').format(),
    updatedAt: moment(turnoff.updatedAt).tz('Asia/Vientiane').format(),
  };
}
