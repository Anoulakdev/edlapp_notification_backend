import { PrismaService } from '../../../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';

export async function findOneMeterstatus(prisma: PrismaService, id: number) {
  const meterstatus = await prisma.meterStatus.findUnique({ where: { id } });
  if (!meterstatus) throw new NotFoundException('meterstatus not found');
  return meterstatus;
}
