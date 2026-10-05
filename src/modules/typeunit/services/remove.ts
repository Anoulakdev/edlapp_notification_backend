import { PrismaService } from '../../../prisma/prisma.service';
import { HttpStatus, NotFoundException } from '@nestjs/common';

export async function removeTypeUnit(prisma: PrismaService, id: number) {
  const typeUnit = await prisma.typeUnit.findUnique({
    where: { id },
  });
  if (!typeUnit) throw new NotFoundException('type unit not found');

  await prisma.typeUnit.delete({ where: { id } });
  return {
    statusCode: HttpStatus.OK,
    message: 'type unit deleted successfully',
  };
}
