import { PrismaService } from '../../../prisma/prisma.service';
import { UpdateRegistermeterDto } from '../dto/update-registermeter.dto';
import { NotFoundException } from '@nestjs/common';

export async function updateReject(
  prisma: PrismaService,
  id: number,
  updateRegistermeterDto: UpdateRegistermeterDto,
) {
  const registermeter = await prisma.registerMeter.findUnique({
    where: { id: Number(id) },
  });
  if (!registermeter) throw new NotFoundException('registerMeter not found');

  return await prisma.registerMeter.update({
    where: { id: Number(id) },
    data: {
      meterStatusId: 4,
      comment: updateRegistermeterDto.comment,
    },
  });
}
