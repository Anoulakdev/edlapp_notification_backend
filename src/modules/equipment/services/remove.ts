import { PrismaService } from '../../../prisma/prisma.service';
import { HttpStatus, NotFoundException } from '@nestjs/common';

export async function removeEquipment(prisma: PrismaService, id: number) {
  const equipment = await prisma.equipment.findUnique({
    where: { id },
  });
  if (!equipment) throw new NotFoundException('equipment not found');

  await prisma.equipment.delete({ where: { id } });
  return {
    statusCode: HttpStatus.OK,
    message: 'equipment deleted successfully',
  };
}
