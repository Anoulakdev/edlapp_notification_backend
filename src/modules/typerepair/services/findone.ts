import { PrismaService } from '../../../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';

export async function findOneTypeRepair(prisma: PrismaService, id: number) {
  const typeRepair = await prisma.typeRepair.findUnique({
    where: { id },
  });
  if (!typeRepair) throw new NotFoundException('type repair not found');
  return typeRepair;
}
