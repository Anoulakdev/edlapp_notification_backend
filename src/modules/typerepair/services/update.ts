import { PrismaService } from '../../../prisma/prisma.service';
import { UpdateTyperepairDto } from '../dto/update-typerepair.dto';
import { NotFoundException } from '@nestjs/common';

export async function updateTypeRepair(
  prisma: PrismaService,
  id: number,
  updateTyperepairDto: UpdateTyperepairDto,
) {
  const typeRepair = await prisma.typeRepair.findUnique({
    where: { id },
  });
  if (!typeRepair) throw new NotFoundException('type repair not found');

  return prisma.typeRepair.update({
    where: { id },
    data: { ...updateTyperepairDto },
  });
}
