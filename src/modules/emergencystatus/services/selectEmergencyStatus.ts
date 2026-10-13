import { PrismaService } from '../../../prisma/prisma.service';
import { MemoryCache } from '../../../utils/cache.util';

export async function selectEmergencyStatus(prisma: PrismaService) {
  const cacheKey = 'select:emergencystatus';
  const cached = MemoryCache.get<any[]>(cacheKey);
  if (cached) return cached;

  const data = await prisma.emergencyStatus.findMany({
    orderBy: {
      id: 'asc',
    },
  });

  MemoryCache.set(cacheKey, data, 5 * 60 * 1000);
  return data;
}
