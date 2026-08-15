import { PrismaService } from '../../../prisma/prisma.service';
import { MemoryCache } from '../../../utils/cache.util';

export async function selectVillage(
  prisma: PrismaService,
  districtCode?: string,
) {
  const cacheKey = `select:villages:${districtCode || 'all'}`;
  const cached = MemoryCache.get<any[]>(cacheKey);
  if (cached) return cached;

  const where = districtCode ? { districtCode } : undefined;

  const data = await prisma.village.findMany({
    where: where,
    orderBy: {
      id: 'asc',
    },
    select: {
      id: true,
      village_name: true,
      districtCode: true,
    },
  });

  MemoryCache.set(cacheKey, data, 5 * 60 * 1000);
  return data;
}

