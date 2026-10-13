import { PrismaService } from '../../../prisma/prisma.service';
import { UpdateMeterstatusDto } from '../dto/update-meterstatus.dto';
import { NotFoundException } from '@nestjs/common';
import { MemoryCache } from '../../../utils/cache.util';

export async function updateMeterstatus(
  prisma: PrismaService,
  id: number,
  updateMeterstatusDto: UpdateMeterstatusDto,
) {
  const meterstatus = await prisma.meterStatus.findUnique({ where: { id } });
  if (!meterstatus) throw new NotFoundException('meterstatus not found');

  const result = await prisma.meterStatus.update({
    where: { id },
    data: updateMeterstatusDto,
  });
  MemoryCache.delete('findall:meter_statuses');
  return result;
}
