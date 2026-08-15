import { PrismaService } from '../../../prisma/prisma.service';
import { AuthUser } from '../../../interfaces/auth-user.interface';
import { Prisma } from '../../../../generated/prisma/client';
import moment from 'moment-timezone';

export class FindAllProblemDocOptions {
  page?: number;
  limit?: number;
  search?: string;
  problemstatusId?: number;
  problemtypeId?: number;
  sourcetypeId?: number;
  problemDate?: string;
  provinceId?: number;
  districtId?: number;
  villageId?: number;
  filterMyDocs?: boolean;
}

export async function FindAllProblemDoc(
  prisma: PrismaService,
  user: AuthUser,
  options: FindAllProblemDocOptions = {},
) {
  const where: Prisma.ProblemDocWhereInput = {};

  if (options.filterMyDocs) {
    where.createdById = user.id;
  }

  if (options.problemDate) {
    where.createdAt = {
      gte: moment(options.problemDate).startOf('day').toDate(),
    };
  }

  if (options.problemstatusId) {
    where.problemstatusId = Number(options.problemstatusId);
  }

  if (options.problemtypeId) {
    where.problemtypeId = Number(options.problemtypeId);
  }

  if (options.sourcetypeId) {
    where.sourcetypeId = Number(options.sourcetypeId);
  }

  if (user?.roleId === 5) {
    if (user.branchId) {
      where.branchId = Number(user.branchId);
    }
    if (options.provinceId) {
      where.provinceId = Number(options.provinceId);
    }
    if (options.districtId) {
      where.districtId = Number(options.districtId);
    }
    if (options.villageId) {
      where.villageId = Number(options.villageId);
    }
  } else if (user?.roleId === 6) {
    if (user.branchId) {
      where.branchId = Number(user.branchId);
    }
    if (user.repairDistrictId) {
      where.repairDistrictId = Number(user.repairDistrictId);
    }
    if (options.provinceId) {
      where.provinceId = Number(options.provinceId);
    }
    if (options.districtId) {
      where.districtId = Number(options.districtId);
    }
    if (options.villageId) {
      where.villageId = Number(options.villageId);
    }
  } else {
    // roles 2, 3, 4, etc. see all documents, filtered by options if provided
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

  if (options.search) {
    const searchLower = options.search.trim();
    if (searchLower) {
      where.OR = [
        { fullName: { contains: searchLower, mode: 'insensitive' } },
        { description: { contains: searchLower, mode: 'insensitive' } },
        { tel: { contains: searchLower, mode: 'insensitive' } },
      ];
    }
  }

  const page = options.page ? Number(options.page) : undefined;
  const limit = options.limit ? Number(options.limit) : undefined;

  const include = {
    province: true,
    district: true,
    village: true,
    problemtype: {
      select: {
        id: true,
        name: true,
      },
    },
    sourcetype: true,
    problemstatus: true,
    branch: {
      select: {
        id: true,
        name: true,
      },
    },
    repairDistrict: {
      select: {
        id: true,
        name: true,
      },
    },
  };

  if (page !== undefined && limit !== undefined) {
    const skip = (page - 1) * limit;
    const take = limit;

    const [data, total] = await Promise.all([
      prisma.problemDoc.findMany({
        where,
        orderBy: {
          id: 'desc',
        },
        include,
        skip,
        take,
      }),
      prisma.problemDoc.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    const mappedData = data.map((problemDoc) => {
      return {
        ...problemDoc,
        createdAt: moment(problemDoc.createdAt).tz('Asia/Vientiane').format(),
        updatedAt: moment(problemDoc.updatedAt).tz('Asia/Vientiane').format(),
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

  const problems = await prisma.problemDoc.findMany({
    where,
    orderBy: {
      id: 'desc',
    },
    include,
  });

  return problems.map((problem) => {
    return {
      ...problem,
      createdAt: moment(problem.createdAt).tz('Asia/Vientiane').format(),
      updatedAt: moment(problem.updatedAt).tz('Asia/Vientiane').format(),
    };
  });
}
