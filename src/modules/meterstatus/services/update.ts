import { PrismaService } from '../../../prisma/prisma.service';
import { UpdateMeterstatusDto } from '../dto/update-meterstatus.dto';
import { NotFoundException } from '@nestjs/common';

export async function updateMeterstatus(
  prisma: PrismaService,
  id: number,
  updateMeterstatusDto: UpdateMeterstatusDto,
) {
  const meterstatus = await prisma.meterStatus.findUnique({ where: { id } });
  if (!meterstatus) throw new NotFoundException('meterstatus not found');

  return prisma.meterStatus.update({
    where: { id },
    data: updateMeterstatusDto,
  });
}
