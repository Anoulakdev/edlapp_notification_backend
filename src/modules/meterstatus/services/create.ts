import { PrismaService } from '../../../prisma/prisma.service';
import { CreateMeterstatusDto } from '../dto/create-meterstatus.dto';
import { MemoryCache } from '../../../utils/cache.util';

export async function createMeterstatus(
  prisma: PrismaService,
  createMeterstatusDto: CreateMeterstatusDto,
) {
  const result = await prisma.meterStatus.create({
    data: createMeterstatusDto,
  });
  MemoryCache.delete('findall:meter_statuses');
  return result;
}
