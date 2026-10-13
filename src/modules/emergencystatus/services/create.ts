import { PrismaService } from '../../../prisma/prisma.service';
import { CreateEmergencystatusDto } from '../dto/create-emergencystatus.dto';
import { MemoryCache } from '../../../utils/cache.util';

export async function createEmergencyStatus(
  prisma: PrismaService,
  createEmergencystatusDto: CreateEmergencystatusDto,
) {
  const result = await prisma.emergencyStatus.create({
    data: createEmergencystatusDto,
  });
  MemoryCache.delete('select:emergency_statuses');
  return result;
}
