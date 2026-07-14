import { PrismaService } from '../../../prisma/prisma.service';
import { AuthUser } from '../../../interfaces/auth-user.interface';
import { Prisma } from '../../../../generated/prisma/client';
import moment from 'moment-timezone';

export class FindAllEmergencyDocOptions {
  page?: number;
  limit?: number;
  search?: string;
  emergencyDate?: string;
  provinceId?: number;
  districtId?: number;
  filterMyDocs?: boolean;
}

export async function FindAllEmergencyDoc(
  prisma: PrismaService,
  user: AuthUser,
  options: FindAllEmergencyDocOptions = {},
) {
  const where: Prisma.EmergencyDocWhereInput = {};
  const andFilters: Prisma.EmergencyDocWhereInput[] = [];

  if (options.emergencyDate) {
    where.emergencyDate = {
      gte: moment.tz(options.emergencyDate, 'Asia/Vientiane').startOf('day').toDate(),
      lte: moment.tz(options.emergencyDate, 'Asia/Vientiane').endOf('day').toDate(),
    };
  }

  if (options.filterMyDocs) {
    where.createdById = user.id;
  } else {
    if (user.roleId === 4) {
      const provinceFilter: Prisma.EmergencyDocWhereInput = {
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
    } else if (user.roleId === 5) {
      andFilters.push({
        OR: [
          { createdById: user.id },
          {
            provinceId: user.provinceId ? Number(user.provinceId) : undefined,
            districtId: user.districtId ? Number(user.districtId) : undefined,
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
  }

  if (options.search) {
    const searchLower = options.search.trim();
    if (searchLower) {
      const searchOr: Prisma.EmergencyDocWhereInput[] = [
        { title: { contains: searchLower, mode: 'insensitive' } },
        { description: { contains: searchLower, mode: 'insensitive' } },
      ];
      const searchNum = Number(searchLower);
      if (!isNaN(searchNum)) {
        searchOr.push({ id: searchNum });
      }
      andFilters.push({ OR: searchOr });
    }
  }

  if (andFilters.length > 0) {
    where.AND = andFilters;
  }

  const page = options.page ? Number(options.page) : undefined;
  const limit = options.limit ? Number(options.limit) : undefined;

  const include = {
    createdBy: {
      select: {
        id: true,
        employee: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            gender: true,
            emp_code: true,
          },
        },
      },
    },
    province: true,
    district: true,
    emergencyAddresses: {
      select: {
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
      prisma.emergencyDoc.findMany({
        where,
        orderBy: {
          id: 'desc',
        },
        include,
        skip,
        take,
      }),
      prisma.emergencyDoc.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    const mappedData = data.map((emergencyDoc) => {
      return {
        ...emergencyDoc,
        emergencyDate: moment(emergencyDoc.emergencyDate)
          .tz('Asia/Vientiane')
          .format('YYYY-MM-DD'),
        createdAt: moment(emergencyDoc.createdAt).tz('Asia/Vientiane').format(),
        updatedAt: moment(emergencyDoc.updatedAt).tz('Asia/Vientiane').format(),
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

  const emergencies = await prisma.emergencyDoc.findMany({
    where,
    orderBy: {
      id: 'desc',
    },
    include,
  });

  return emergencies.map((emergencyDoc) => {
    return {
      ...emergencyDoc,
      emergencyDate: moment(emergencyDoc.emergencyDate)
        .tz('Asia/Vientiane')
        .format('YYYY-MM-DD'),
      createdAt: moment(emergencyDoc.createdAt).tz('Asia/Vientiane').format(),
      updatedAt: moment(emergencyDoc.updatedAt).tz('Asia/Vientiane').format(),
    };
  });
}
