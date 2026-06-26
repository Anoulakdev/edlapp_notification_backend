import { PrismaService } from '../../../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';
import moment from 'moment-timezone';

export async function findOneEmergencyAssign(
  prisma: PrismaService,
  id: number,
) {
  const emergencyAssign = await prisma.emergencyAssign.findUnique({
    where: { id },
    include: {
      emergency: true,
    },
  });
  if (!emergencyAssign) throw new NotFoundException('emergency not found');
  return {
    ...emergencyAssign,
    createdAt: moment(emergencyAssign.createdAt).tz('Asia/Vientiane').format(),
    updatedAt: moment(emergencyAssign.updatedAt).tz('Asia/Vientiane').format(),
    emergency: {
      ...emergencyAssign.emergency,
      emergencyDate: moment(emergencyAssign.emergency.emergencyDate)
        .tz('Asia/Vientiane')
        .format('YYYY-MM-DD'),
    },
  };
}
