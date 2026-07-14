import { PrismaService } from '../../../prisma/prisma.service';
import { AuthUser } from '../../../interfaces/auth-user.interface';
import { Prisma } from '../../../../generated/prisma/client';

export async function selectDistrict(
  prisma: PrismaService,
  provinceCode?: string,
  user?: AuthUser,
) {
  const where: Prisma.DistrictWhereInput = {};

  if (provinceCode) {
    where.provinceCode = provinceCode;
  }

  if (user && user.roleId === 4 && provinceCode === '1') {
    if (user.employee?.divisionId === 185) {
      where.id = { in: [1, 2, 3, 4] };
    } else if (user.employee?.divisionId === 188) {
      where.id = { in: [5, 6, 7, 8, 9] };
    }
  }

  return prisma.district.findMany({
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
}
