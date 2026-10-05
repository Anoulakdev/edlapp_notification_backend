import { PrismaService } from '../../../prisma/prisma.service';
import { UpdateEquipmentDto } from '../dto/update-equipment.dto';
import { NotFoundException } from '@nestjs/common';

export async function updateEquipment(
  prisma: PrismaService,
  id: number,
  updateEquipmentDto: UpdateEquipmentDto,
) {
  const equipment = await prisma.equipment.findUnique({
    where: { id },
  });
  if (!equipment) throw new NotFoundException('equipment not found');

  return prisma.equipment.update({
    where: { id },
    data: { ...updateEquipmentDto },
  });
}
