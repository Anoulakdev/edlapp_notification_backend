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

  if (options.filterMyDocs) {
    where.createdById = user.id;
  }

  if (options.emergencyDate) {
    where.emergencyDate = {
      gte: moment(options.emergencyDate).startOf('day').toDate(),
    };
  }

  if (user.roleId === 4) {
    where.provinceId = user.provinceId ? Number(user.provinceId) : undefined;
    if (options.districtId) {
      where.districtId = Number(options.districtId);
    }
  } else if (user.roleId === 5) {
    where.provinceId = user.provinceId ? Number(user.provinceId) : undefined;
    where.districtId = user.districtId ? Number(user.districtId) : undefined;
  } else {
    if (options.provinceId) {
      where.provinceId = Number(options.provinceId);
    }
    if (options.districtId) {
      where.districtId = Number(options.districtId);
    }
  }

  if (options.search) {
    const searchLower = options.search.trim();
    if (searchLower) {
      where.OR = [
        { title: { contains: searchLower, mode: 'insensitive' } },
        { description: { contains: searchLower, mode: 'insensitive' } },
      ];
    }
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
        emergencyDate: moment(emergencyDoc.emergencyDate).format('YYYY-MM-DD'),
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
      emergencyDate: moment(emergencyDoc.emergencyDate).format('YYYY-MM-DD'),
      createdAt: moment(emergencyDoc.createdAt).tz('Asia/Vientiane').format(),
      updatedAt: moment(emergencyDoc.updatedAt).tz('Asia/Vientiane').format(),
    };
  });
}
