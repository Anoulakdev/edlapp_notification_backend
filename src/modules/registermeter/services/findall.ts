import { PrismaService } from '../../../prisma/prisma.service';
import { AuthUser } from '../../../interfaces/auth-user.interface';
import { Prisma } from '../../../../generated/prisma/client';
import moment from 'moment-timezone';

export class FindAllRegistermeterOptions {
  page?: number;
  limit?: number;
  search?: string;
  meterStatusId?: number;
  sourcetypeId?: number;
  provinceId?: number;
  districtId?: number;
  villageId?: number;
  filterMyDocs?: boolean;
}

export async function FindAllRegistermeter(
  prisma: PrismaService,
  user: AuthUser,
  options: FindAllRegistermeterOptions = {},
) {
  const where: Prisma.RegisterMeterWhereInput = {};
  const andFilters: Prisma.RegisterMeterWhereInput[] = [];

  if (user.roleId === 4) {
    if (options.meterStatusId) {
      const queriedStatus = Number(options.meterStatusId);
      if (queriedStatus === 2 || queriedStatus === 3) {
        where.meterStatusId = queriedStatus;
      } else {
        where.meterStatusId = -999;
      }
    } else {
      where.meterStatusId = { in: [2, 3] };
    }
  } else if (user.roleId === 5) {
    if (options.meterStatusId) {
      const queriedStatus = Number(options.meterStatusId);
      if (queriedStatus === 3) {
        where.meterStatusId = queriedStatus;
      } else {
        where.meterStatusId = -999;
      }
    } else {
      where.meterStatusId = 3;
    }
  } else {
    if (options.meterStatusId) {
      where.meterStatusId = Number(options.meterStatusId);
    }
  }
  if (options.sourcetypeId) {
    where.sourcetypeId = Number(options.sourcetypeId);
  }

  if (options.filterMyDocs) {
    where.createdById = user.id;
  } else {
    if (user.roleId === 4) {
      const provinceFilter: Prisma.RegisterMeterWhereInput = {
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
      if (options.villageId) {
        provinceFilter.villageId = Number(options.villageId);
      }
      andFilters.push({
        OR: [{ createdById: user.id }, provinceFilter],
      });
    } else if (user.roleId === 5) {
      andFilters.push({
        OR: [
          { createdById: user.id },
          {
            provinceId: user.provinceId ? Number(user.provinceId) : undefined,
            districtId: user.districtId ? Number(user.districtId) : undefined,
            villageId: options.villageId ? Number(options.villageId) : undefined,
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
      if (options.villageId) {
        where.villageId = Number(options.villageId);
      }
    }
  }

  if (options.search) {
    const searchLower = options.search.trim();
    if (searchLower) {
      andFilters.push({
        OR: [
          { fullName: { contains: searchLower, mode: 'insensitive' } },
          { phone: { contains: searchLower, mode: 'insensitive' } },
          { accountNear: { contains: searchLower, mode: 'insensitive' } },
        ],
      });
    }
  }

  if (andFilters.length > 0) {
    where.AND = andFilters;
  }

  const page = options.page ? Number(options.page) : undefined;
  const limit = options.limit ? Number(options.limit) : undefined;

  const include = {
    province: true,
    district: true,
    village: true,
    meterStatus: true,
    sourcetype: true,
    userAcceptMeters: true,
  };

  if (page !== undefined && limit !== undefined) {
    const skip = (page - 1) * limit;
    const take = limit;

    const [data, total] = await Promise.all([
      prisma.registerMeter.findMany({
        where,
        orderBy: {
          id: 'desc',
        },
        include,
        skip,
        take,
      }),
      prisma.registerMeter.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    const mappedData = data.map((registerMeter) => {
      return {
        ...registerMeter,
        createdAt: moment(registerMeter.createdAt)
          .tz('Asia/Vientiane')
          .format(),
        updatedAt: moment(registerMeter.updatedAt)
          .tz('Asia/Vientiane')
          .format(),
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

  const registerMeters = await prisma.registerMeter.findMany({
    where,
    orderBy: {
      id: 'desc',
    },
    include,
  });

  return registerMeters.map((registerMeter) => {
    return {
      ...registerMeter,
      createdAt: moment(registerMeter.createdAt).tz('Asia/Vientiane').format(),
      updatedAt: moment(registerMeter.updatedAt).tz('Asia/Vientiane').format(),
    };
  });
}
