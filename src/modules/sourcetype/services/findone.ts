import { PrismaService } from '../../../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';

export async function findOneSourceType(prisma: PrismaService, id: number) {
  const sourceType = await prisma.sourceType.findUnique({ where: { id } });
  if (!sourceType) throw new NotFoundException('sourceType not found');
  return sourceType;
}
