import { PrismaService } from '../../../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';

export async function findOneTypeUnit(prisma: PrismaService, id: number) {
  const typeUnit = await prisma.typeUnit.findUnique({
    where: { id },
  });
  if (!typeUnit) throw new NotFoundException('type unit not found');
  return typeUnit;
}
