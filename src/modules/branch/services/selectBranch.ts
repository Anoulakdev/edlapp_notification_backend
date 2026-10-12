import { PrismaService } from '../../../prisma/prisma.service';
import { MemoryCache } from '../../../utils/cache.util';

export async function selectBranch(prisma: PrismaService) {
  const cacheKey = 'select:branches';
  const cached = MemoryCache.get<any[]>(cacheKey);
  if (cached) return cached;

  const branches = await prisma.branch.findMany({
    orderBy: {
      code: 'asc',
    },
    select: {
      id: true,
      name: true,
      code: true,
    },
  });

  MemoryCache.set(cacheKey, branches, 5 * 60 * 1000);
  return branches;
}
