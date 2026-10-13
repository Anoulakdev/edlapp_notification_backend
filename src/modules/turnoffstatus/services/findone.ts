import { PrismaService } from '../../../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';

export async function findOneTurnoffStatus(prisma: PrismaService, id: number) {
  const turnoffStatus = await prisma.turnoffStatus.findUnique({
    where: { id },
  });
  if (!turnoffStatus) throw new NotFoundException('turnoffStatus not found');
  return turnoffStatus;
}
