import { PrismaService } from '../../../prisma/prisma.service';
import { UpdateTurnoffstatusDto } from '../dto/update-turnoffstatus.dto';
import { NotFoundException } from '@nestjs/common';
import { MemoryCache } from '../../../utils/cache.util';

export async function updateTurnoffStatus(
  prisma: PrismaService,
  id: number,
  updateTurnoffstatusDto: UpdateTurnoffstatusDto,
) {
  const turnoffStatus = await prisma.turnoffStatus.findUnique({
    where: { id },
  });
  if (!turnoffStatus) throw new NotFoundException('turnoffStatus not found');

  const result = await prisma.turnoffStatus.update({
    where: { id },
    data: updateTurnoffstatusDto,
  });
  MemoryCache.delete('select:turnoff_statuses');
  return result;
}
