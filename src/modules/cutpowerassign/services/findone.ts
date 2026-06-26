import { PrismaService } from '../../../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';
import moment from 'moment-timezone';

export async function findOneCutpowerAssign(prisma: PrismaService, id: number) {
  const cutpowerAssign = await prisma.cutpowerAssign.findUnique({
    where: { id },
    include: {
      cutpower: true,
    },
  });
  if (!cutpowerAssign) throw new NotFoundException('cutpower not found');
  return {
    ...cutpowerAssign,
    createdAt: moment(cutpowerAssign.createdAt).tz('Asia/Vientiane').format(),
    updatedAt: moment(cutpowerAssign.updatedAt).tz('Asia/Vientiane').format(),
    cutpower: {
      ...cutpowerAssign.cutpower,
      cutpowerDate: moment(cutpowerAssign.cutpower.cutpowerDate)
        .tz('Asia/Vientiane')
        .format('YYYY-MM-DD'),
    },
  };
}
