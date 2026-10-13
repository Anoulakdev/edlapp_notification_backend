import { PrismaService } from '../../../prisma/prisma.service';
import { MemoryCache } from '../../../utils/cache.util';

export async function selectTurnoffStatus(prisma: PrismaService) {
  const cacheKey = 'select:turnoffstatus';
  const cached = MemoryCache.get<any[]>(cacheKey);
  if (cached) return cached;

  const data = await prisma.turnoffStatus.findMany({
    orderBy: {
      id: 'asc',
    },
  });

  MemoryCache.set(cacheKey, data, 5 * 60 * 1000);
  return data;
}
