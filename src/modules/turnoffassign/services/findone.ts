import { PrismaService } from '../../../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';
import moment from 'moment-timezone';

export async function findOneTurnoffAssign(prisma: PrismaService, id: number) {
  const turnoffAssign = await prisma.turnoffAssign.findUnique({
    where: { id },
    include: {
      turnoff: true,
    },
  });
  if (!turnoffAssign) throw new NotFoundException('turnoff not found');
  return {
    ...turnoffAssign,
    createdAt: moment(turnoffAssign.createdAt).tz('Asia/Vientiane').format(),
    updatedAt: moment(turnoffAssign.updatedAt).tz('Asia/Vientiane').format(),
    turnoff: {
      ...turnoffAssign.turnoff,
      startDate: moment(turnoffAssign.turnoff.startDate).format('YYYY-MM-DD'),
      endDate: moment(turnoffAssign.turnoff.endDate).format('YYYY-MM-DD'),
    },
  };
}
