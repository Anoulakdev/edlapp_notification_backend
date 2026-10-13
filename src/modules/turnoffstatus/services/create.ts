import { PrismaService } from '../../../prisma/prisma.service';
import { CreateTurnoffstatusDto } from '../dto/create-turnoffstatus.dto';
import { MemoryCache } from '../../../utils/cache.util';

export async function createTurnoffStatus(
  prisma: PrismaService,
  createTurnoffstatusDto: CreateTurnoffstatusDto,
) {
  const result = await prisma.turnoffStatus.create({
    data: createTurnoffstatusDto,
  });
  MemoryCache.delete('select:turnoff_statuses');
  return result;
}
