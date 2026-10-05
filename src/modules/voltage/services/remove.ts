import { PrismaService } from '../../../prisma/prisma.service';
import { HttpStatus, NotFoundException } from '@nestjs/common';

export async function removeVoltage(prisma: PrismaService, id: number) {
  const voltage = await prisma.voltage.findUnique({ where: { id } });
  if (!voltage) throw new NotFoundException('voltage not found');

  await prisma.voltage.delete({ where: { id } });
  return {
    statusCode: HttpStatus.OK,
    message: 'voltage deleted successfully',
  };
}
