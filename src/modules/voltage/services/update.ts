import { PrismaService } from '../../../prisma/prisma.service';
import { UpdateVoltageDto } from '../dto/update-voltage.dto';
import { NotFoundException } from '@nestjs/common';

export async function updateVoltage(
  prisma: PrismaService,
  id: number,
  updateVoltageDto: UpdateVoltageDto,
) {
  const voltage = await prisma.voltage.findUnique({ where: { id } });
  if (!voltage) throw new NotFoundException('voltage not found');

  return prisma.voltage.update({
    where: { id },
    data: { ...updateVoltageDto },
  });
}
