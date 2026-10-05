import { PrismaService } from '../../../prisma/prisma.service';
import { AuthUser } from '../../../interfaces/auth-user.interface';
import { Prisma } from '../../../../generated/prisma/client';

export async function countMeter(prisma: PrismaService, user: AuthUser) {
  const where: Prisma.RegisterMeterWhereInput = {};
  const andFilters: Prisma.RegisterMeterWhereInput[] = [];

  if (
    user.roleId === 1 ||
    user.roleId === 2 ||
    user.roleId === 3 ||
    user.roleId === 4
  ) {
    where.meterStatusId = 1;
  } else if (user.roleId === 5) {
    where.meterStatusId = 2;
    const provinceFilter: Prisma.RegisterMeterWhereInput = {
      provinceId: user.provinceId ? Number(user.provinceId) : undefined,
    };

    if (user.provinceId === 1 && user.employee?.divisionId === 185) {
      provinceFilter.districtId = { in: [1, 2, 3, 4] };
    } else if (user.provinceId === 1 && user.employee?.divisionId === 188) {
      provinceFilter.districtId = { in: [5, 6, 7, 8, 9] };
    } else {
      if (user.districtId) {
        provinceFilter.districtId = Number(user.districtId);
      }
    }

    andFilters.push(provinceFilter);
  } else if (user.roleId === 6) {
    where.meterStatusId = 2;
    const districtFilter: Prisma.RegisterMeterWhereInput = {
      provinceId: user.provinceId ? Number(user.provinceId) : undefined,
      districtId: user.districtId ? Number(user.districtId) : undefined,
    };
    andFilters.push(districtFilter);
  }

  if (andFilters.length > 0) {
    where.AND = andFilters;
  }

  const total = await prisma.registerMeter.count({ where });

  return {
    total,
  };
}
