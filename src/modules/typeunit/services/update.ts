import { PrismaService } from '../../../prisma/prisma.service';
import { UpdateTypeunitDto } from '../dto/update-typeunit.dto';
import { NotFoundException } from '@nestjs/common';

export async function updateTypeUnit(
  prisma: PrismaService,
  id: number,
  updateTypeunitDto: UpdateTypeunitDto,
) {
  const typeUnit = await prisma.typeUnit.findUnique({
    where: { id },
  });
  if (!typeUnit) throw new NotFoundException('type unit not found');

  return prisma.typeUnit.update({
    where: { id },
    data: { ...updateTypeunitDto },
  });
}
