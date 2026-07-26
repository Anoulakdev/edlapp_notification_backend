import { PrismaService } from '../../../prisma/prisma.service';
import { HttpStatus, NotFoundException } from '@nestjs/common';

export async function removeRepairDistrict(prisma: PrismaService, id: number) {
  const repairdistrict = await prisma.repairDistrict.findUnique({
    where: { id },
  });
  if (!repairdistrict) throw new NotFoundException('repairdistrict not found');

  await prisma.repairDistrict.delete({ where: { id } });
  return {
    statusCode: HttpStatus.OK,
    message: 'repairdistrict deleted successfully',
  };
}
