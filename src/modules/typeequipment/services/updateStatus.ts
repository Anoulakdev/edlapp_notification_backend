import { HttpStatus, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

export async function updateStatus(
  prisma: PrismaService,
  id: number,
  actived: string,
) {
  const typeEquipment = await prisma.typeEquipment.findUnique({
    where: { id },
  });

  if (!typeEquipment) {
    throw new NotFoundException('type equipment not found');
  }

  await prisma.typeEquipment.update({
    where: { id },
    data: { actived: actived === 'true' ? true : false },
  });

  return {
    statusCode: HttpStatus.OK,
    message: 'update status type equipment successfully',
  };
}
