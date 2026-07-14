import { PrismaService } from '../../../prisma/prisma.service';
import { AuthUser } from '../../../interfaces/auth-user.interface';
import { Prisma } from '../../../../generated/prisma/client';
import moment from 'moment-timezone';

export class FindAllCutpowerDocOptions {
  page?: number;
  limit?: number;
  search?: string;
  cutpowerDate?: string;
  provinceId?: number;
  districtId?: number;
  filterMyDocs?: boolean;
}

export async function FindAllCutpowerDoc(
  prisma: PrismaService,
  user: AuthUser,
  options: FindAllCutpowerDocOptions = {},
) {
  const where: Prisma.CutpowerDocWhereInput = {};
  const andFilters: Prisma.CutpowerDocWhereInput[] = [];

  if (options.cutpowerDate) {
    where.cutpowerDate = {
      gte: moment.tz(options.cutpowerDate, 'Asia/Vientiane').startOf('day').toDate(),
      lte: moment.tz(options.cutpowerDate, 'Asia/Vientiane').endOf('day').toDate(),
    };
  }

  if (options.filterMyDocs) {
    where.createdById = user.id;
  } else {
    if (user.roleId === 4) {
      const provinceFilter: Prisma.CutpowerDocWhereInput = {
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
      const searchOr: Prisma.CutpowerDocWhereInput[] = [
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
    cutpowerAddresses: {
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
      prisma.cutpowerDoc.findMany({
        where,
        orderBy: {
          id: 'desc',
        },
        include,
        skip,
        take,
      }),
      prisma.cutpowerDoc.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    const mappedData = data.map((cutpower) => {
      return {
        ...cutpower,
        cutpowerDate: moment(cutpower.cutpowerDate)
          .tz('Asia/Vientiane')
          .format('YYYY-MM-DD'),
        createdAt: moment(cutpower.createdAt).tz('Asia/Vientiane').format(),
        updatedAt: moment(cutpower.updatedAt).tz('Asia/Vientiane').format(),
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

  const cutpowerDocs = await prisma.cutpowerDoc.findMany({
    where,
    orderBy: {
      id: 'desc',
    },
    include,
  });

  return cutpowerDocs.map((cutpowerDoc) => {
    return {
      ...cutpowerDoc,
      cutpowerDate: moment(cutpowerDoc.cutpowerDate)
        .tz('Asia/Vientiane')
        .format('YYYY-MM-DD'),
      createdAt: moment(cutpowerDoc.createdAt).tz('Asia/Vientiane').format(),
      updatedAt: moment(cutpowerDoc.updatedAt).tz('Asia/Vientiane').format(),
    };
  });
}
