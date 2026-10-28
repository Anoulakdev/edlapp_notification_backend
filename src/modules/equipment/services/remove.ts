import { PrismaService } from '../../../prisma/prisma.service';
import {
  BadRequestException,
  HttpStatus,
  NotFoundException,
} from '@nestjs/common';

export async function removeEquipment(prisma: PrismaService, id: number) {
  const equipment = await prisma.equipment.findUnique({
    where: { id },
  });
  if (!equipment) throw new NotFoundException('equipment not found');

  const usedCount = await prisma.problemEquipment.count({
    where: { equipmentId: id },
  });
  if (usedCount > 0) {
    throw new BadRequestException(
      'Cannot delete equipment because it is already used in repair records',
    );
  }

  await prisma.equipment.delete({ where: { id } });
  return {
    statusCode: HttpStatus.OK,
    message: 'equipment deleted successfully',
  };
}
