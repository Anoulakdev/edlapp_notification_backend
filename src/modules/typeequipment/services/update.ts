import { PrismaService } from '../../../prisma/prisma.service';
import { UpdateTypeequipmentDto } from '../dto/update-typeequipment.dto';
import { NotFoundException } from '@nestjs/common';

export async function updateTypeEquipment(
  prisma: PrismaService,
  id: number,
  updateTypeequipmentDto: UpdateTypeequipmentDto,
) {
  const typeEquipment = await prisma.typeEquipment.findUnique({
    where: { id },
  });
  if (!typeEquipment) throw new NotFoundException('type equipment not found');

  return prisma.typeEquipment.update({
    where: { id },
    data: { ...updateTypeequipmentDto },
  });
}
