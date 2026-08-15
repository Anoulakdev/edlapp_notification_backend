import { PrismaService } from '../../../prisma/prisma.service';
import { MemoryCache } from '../../../utils/cache.util';

export async function selectProblemType(prisma: PrismaService) {
  const cacheKey = 'select:problemtypes';
  const cached = MemoryCache.get<any[]>(cacheKey);
  if (cached) return cached;

  const data = await prisma.problemType.findMany({
    where: {
      actived: true,
    },
    orderBy: {
      code: 'asc',
    },
    select: {
      id: true,
      name: true,
      code: true,
    },
  });

  MemoryCache.set(cacheKey, data, 5 * 60 * 1000);
  return data;
}

