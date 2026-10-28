import { PrismaService } from '../../../prisma/prisma.service';
import { AuthUser } from '../../../interfaces/auth-user.interface';
import { Prisma } from '../../../../generated/prisma/client';

export async function countProblem(prisma: PrismaService, user: AuthUser) {
  const where: Prisma.ProblemDocWhereInput = {};
  const andFilters: Prisma.ProblemDocWhereInput[] = [];

  if (user.roleId === 5) {
    where.problemstatusId = 1;
    const provinceFilter: Prisma.ProblemDocWhereInput = {
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
    where.problemstatusId = 2;
    if (user.branchId) {
      where.branchId = Number(user.branchId);
    }
    if (user.repairDistrictId) {
      where.repairDistrictId = Number(user.repairDistrictId);
    }
  } else {
    where.problemstatusId = 1;
  }

  if (andFilters.length > 0) {
    where.AND = andFilters;
  }

  const total = await prisma.problemDoc.count({ where });

  return {
    total,
  };
}
