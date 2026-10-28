import { HttpStatus, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

export async function updateStatus(
  prisma: PrismaService,
  id: number,
  actived: string,
) {
  const typeRepair = await prisma.typeRepair.findUnique({
    where: { id },
  });

  if (!typeRepair) {
    throw new NotFoundException('type repair not found');
  }

  await prisma.typeRepair.update({
    where: { id },
    data: { actived: actived === 'true' ? true : false },
  });

  return {
    statusCode: HttpStatus.OK,
    message: 'update status type repair successfully',
  };
}
