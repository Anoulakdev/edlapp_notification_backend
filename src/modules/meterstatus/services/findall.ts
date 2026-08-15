import { PrismaService } from '../../../prisma/prisma.service';
import { MemoryCache } from '../../../utils/cache.util';

export async function findAllMeterstatus(prisma: PrismaService) {
  const cacheKey = 'select:meterstatus';
  const cached = MemoryCache.get<any[]>(cacheKey);
  if (cached) return cached;

  const data = await prisma.meterStatus.findMany({
    orderBy: {
      id: 'asc',
    },
  });

  MemoryCache.set(cacheKey, data, 5 * 60 * 1000);
  return data;
}

