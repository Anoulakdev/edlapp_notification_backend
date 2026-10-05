import { HttpStatus, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

export async function updateStatus(
  prisma: PrismaService,
  id: number,
  actived: string,
) {
  const typeUnit = await prisma.typeUnit.findUnique({
    where: { id },
  });

  if (!typeUnit) {
    throw new NotFoundException('type unit not found');
  }

  await prisma.typeUnit.update({
    where: { id },
    data: { actived: actived === 'true' ? true : false },
  });

  return {
    statusCode: HttpStatus.OK,
    message: 'update status type equipment successfully',
  };
}
