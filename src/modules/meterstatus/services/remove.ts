import { PrismaService } from '../../../prisma/prisma.service';
import { HttpStatus, NotFoundException } from '@nestjs/common';

export async function removeMeterstatus(prisma: PrismaService, id: number) {
  const meterstatus = await prisma.meterStatus.findUnique({ where: { id } });
  if (!meterstatus) throw new NotFoundException('meterstatus not found');

  await prisma.meterStatus.delete({ where: { id } });
  return {
    statusCode: HttpStatus.OK,
    message: 'meterstatus deleted successfully',
  };
}
