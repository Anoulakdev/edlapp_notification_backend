import { PrismaService } from '../../../prisma/prisma.service';
import { AuthUser } from '../../../interfaces/auth-user.interface';
import { Prisma } from '../../../../generated/prisma/client';
import { MemoryCache } from '../../../utils/cache.util';

export async function selectDistrict(
  prisma: PrismaService,
  provinceCode?: string,
  user?: AuthUser,
) {
  const isSpecialRole5 =
    user && user.roleId === 5 && provinceCode === '1';
  const divisionId = user?.employee?.divisionId;

  const cacheKey = `select:districts:${provinceCode || 'all'}:${isSpecialRole5 ? divisionId : 'normal'}`;
  const cached = MemoryCache.get<any[]>(cacheKey);
  if (cached) return cached;

  const where: Prisma.DistrictWhereInput = {};

  if (provinceCode) {
    where.provinceCode = provinceCode;
  }

  if (isSpecialRole5) {
    if (divisionId === 185) {
      where.id = { in: [1, 2, 3, 4] };
    } else if (divisionId === 188) {
      where.id = { in: [5, 6, 7, 8, 9] };
    }
  }

  const data = await prisma.district.findMany({
    where: where,
    orderBy: {
      id: 'asc',
    },
    select: {
      id: true,
      district_name: true,
      district_code: true,
      provinceCode: true,
    },
  });

  MemoryCache.set(cacheKey, data, 5 * 60 * 1000);
  return data;
}

