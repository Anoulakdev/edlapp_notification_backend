import { PrismaService } from '../../../prisma/prisma.service';
import { HttpStatus, NotFoundException } from '@nestjs/common';

export async function removeTypeEquipment(prisma: PrismaService, id: number) {
  const typeEquipment = await prisma.typeEquipment.findUnique({
    where: { id },
  });
  if (!typeEquipment) throw new NotFoundException('type equipment not found');

  await prisma.typeEquipment.delete({ where: { id } });
  return {
    statusCode: HttpStatus.OK,
    message: 'type equipment deleted successfully',
  };
}
