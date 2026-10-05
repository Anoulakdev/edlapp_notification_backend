import { HttpStatus, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

export async function updateStatus(
  prisma: PrismaService,
  id: number,
  actived: string,
) {
  const equipment = await prisma.equipment.findUnique({
    where: { id },
  });

  if (!equipment) {
    throw new NotFoundException('equipment not found');
  }

  await prisma.equipment.update({
    where: { id },
    data: { actived: actived === 'true' ? true : false },
  });

  return {
    statusCode: HttpStatus.OK,
    message: 'update status type equipment successfully',
  };
}
