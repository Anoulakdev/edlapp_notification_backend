import { PrismaService } from '../../../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';

export async function findOneVoltage(prisma: PrismaService, id: number) {
  const voltage = await prisma.voltage.findUnique({
    where: { id },
  });
  if (!voltage) throw new NotFoundException('voltage not found');
  return voltage;
}
