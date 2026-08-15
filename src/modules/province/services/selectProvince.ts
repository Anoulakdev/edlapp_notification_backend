import { PrismaService } from '../../../prisma/prisma.service';
import { MemoryCache } from '../../../utils/cache.util';

export async function selectProvince(prisma: PrismaService) {
  const cacheKey = 'select:provinces';
  const cached = MemoryCache.get<any[]>(cacheKey);
  if (cached) return cached;

  const data = await prisma.province.findMany({
    orderBy: {
      id: 'asc',
    },
    select: {
      id: true,
      province_name: true,
      province_code: true,
    },
  });

  MemoryCache.set(cacheKey, data, 5 * 60 * 1000);
  return data;
}

