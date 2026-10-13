import { PrismaService } from '../../../prisma/prisma.service';
import { UpdateEmergencystatusDto } from '../dto/update-emergencystatus.dto';
import { NotFoundException } from '@nestjs/common';
import { MemoryCache } from '../../../utils/cache.util';

export async function updateEmergencyStatus(
  prisma: PrismaService,
  id: number,
  updateEmergencystatusDto: UpdateEmergencystatusDto,
) {
  const emergencyStatus = await prisma.emergencyStatus.findUnique({
    where: { id },
  });
  if (!emergencyStatus)
    throw new NotFoundException('emergencyStatus not found');

  const result = await prisma.emergencyStatus.update({
    where: { id },
    data: updateEmergencystatusDto,
  });
  MemoryCache.delete('select:emergency_statuses');
  return result;
}
