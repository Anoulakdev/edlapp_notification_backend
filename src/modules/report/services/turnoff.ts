import { PrismaService } from '../../../prisma/prisma.service';
import { AuthUser } from '../../../interfaces/auth-user.interface';
import { Prisma } from '../../../../generated/prisma/client';
import moment from 'moment-timezone';

export class TurnoffOptions {
  page?: number;
  limit?: number;
  startDate?: string;
  endDate?: string;
  provinceId?: number;
  districtId?: number;
}

export async function turnoffReport(
  prisma: PrismaService,
  user: AuthUser,
  options: TurnoffOptions = {},
) {
  const where: Prisma.TurnoffDocWhereInput = {};
  const andFilters: Prisma.TurnoffDocWhereInput[] = [];

  if (options.startDate || options.endDate) {
    const dateFilter: Prisma.DateTimeFilter = {};
    if (options.startDate) {
      dateFilter.gte = moment(options.startDate).startOf('day').toDate();
    }
    if (options.endDate) {
      dateFilter.lte = moment(options.endDate).endOf('day').toDate();
    }
    where.startDate = dateFilter;
  }

  if (user.roleId === 5) {
    const provinceFilter: Prisma.TurnoffDocWhereInput = {
      provinceId: user.provinceId ? Number(user.provinceId) : undefined,
    };
    if (user.provinceId === 1 && user.employee?.divisionId === 185) {
      if (options.districtId) {
        const targetDistrictId = Number(options.districtId);
        if ([1, 2, 3, 4].includes(targetDistrictId)) {
          provinceFilter.districtId = targetDistrictId;
        } else {
          provinceFilter.districtId = { in: [] };
        }
      } else {
        provinceFilter.districtId = { in: [1, 2, 3, 4] };
      }
    } else if (user.provinceId === 1 && user.employee?.divisionId === 188) {
      if (options.districtId) {
        const targetDistrictId = Number(options.districtId);
        if ([5, 6, 7, 8, 9].includes(targetDistrictId)) {
          provinceFilter.districtId = targetDistrictId;
        } else {
          provinceFilter.districtId = { in: [] };
        }
      } else {
        provinceFilter.districtId = { in: [5, 6, 7, 8, 9] };
      }
    } else {
      if (options.districtId) {
        provinceFilter.districtId = Number(options.districtId);
      }
    }
    andFilters.push({
      OR: [{ createdById: user.id }, provinceFilter],
    });
  } else if (user.roleId === 6) {
    andFilters.push({
      OR: [
        { createdById: user.id },
        {
          provinceId: user.provinceId ? Number(user.provinceId) : undefined,
          districtId: options.districtId
            ? Number(options.districtId)
            : user.districtId
              ? Number(user.districtId)
              : undefined,
        },
      ],
    });
  } else {
    if (options.provinceId) {
      where.provinceId = Number(options.provinceId);
    }
    if (options.districtId) {
      where.districtId = Number(options.districtId);
    }
  }

  if (andFilters.length > 0) {
    where.AND = andFilters;
  }

  const page = options.page ? Number(options.page) : undefined;
  const limit = options.limit ? Number(options.limit) : undefined;

  const include = {
    // createdBy: {
    //   select: {
    //     id: true,
    //     employee: {
    //       select: {
    //         id: true,
    //         first_name: true,
    //         last_name: true,
    //         gender: true,
    //         emp_code: true,
    //       },
    //     },
    //   },
    // },
    province: true,
    district: true,
    turnoffAddresses: {
      select: {
        id: true,
        villageId: true,
        userCount: true,
        village: {
          select: {
            id: true,
            village_name: true,
          },
        },
      },
    },
  };

  if (page !== undefined && limit !== undefined) {
    const skip = (page - 1) * limit;
    const take = limit;

    const [data, total] = await Promise.all([
      prisma.turnoffDoc.findMany({
        where,
        orderBy: {
          id: 'asc',
        },
        include,
        skip,
        take,
      }),
      prisma.turnoffDoc.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    const mappedData = data.map((turnoff) => {
      return {
        ...turnoff,
        startDate: moment(turnoff.startDate).format('YYYY-MM-DD'),
        endDate: moment(turnoff.endDate).format('YYYY-MM-DD'),
        createdAt: moment(turnoff.createdAt).tz('Asia/Vientiane').format(),
        updatedAt: moment(turnoff.updatedAt).tz('Asia/Vientiane').format(),
      };
    });

    return {
      data: mappedData,
      total,
      page,
      limit,
      totalPages,
    };
  }

  const turnoffs = await prisma.turnoffDoc.findMany({
    where,
    orderBy: {
      id: 'desc',
    },
    include,
  });

  return turnoffs.map((turnoff) => {
    return {
      ...turnoff,
      startDate: moment(turnoff.startDate).format('YYYY-MM-DD'),
      endDate: moment(turnoff.endDate).format('YYYY-MM-DD'),
      createdAt: moment(turnoff.createdAt).tz('Asia/Vientiane').format(),
      updatedAt: moment(turnoff.updatedAt).tz('Asia/Vientiane').format(),
    };
  });
}
