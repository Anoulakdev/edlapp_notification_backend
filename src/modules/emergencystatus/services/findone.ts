import { PrismaService } from '../../../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';

export async function findOneEmergencyStatus(
  prisma: PrismaService,
  id: number,
) {
  const emergencyStatus = await prisma.emergencyStatus.findUnique({
    where: { id },
  });
  if (!emergencyStatus)
    throw new NotFoundException('emergencyStatus not found');
  return emergencyStatus;
}
