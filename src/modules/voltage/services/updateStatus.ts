import { HttpStatus, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

export async function updateStatus(
  prisma: PrismaService,
  id: number,
  actived: string,
) {
  const voltage = await prisma.voltage.findUnique({ where: { id } });

  if (!voltage) {
    throw new NotFoundException('Voltage not found');
  }

  await prisma.voltage.update({
    where: { id },
    data: { actived: actived === 'true' ? true : false },
  });

  return {
    statusCode: HttpStatus.OK,
    message: 'Update status successfully',
  };
}
