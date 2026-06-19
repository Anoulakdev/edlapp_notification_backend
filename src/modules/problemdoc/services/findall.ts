import { PrismaService } from '../../../prisma/prisma.service';
import { AuthUser } from '../../../interfaces/auth-user.interface';
import { Prisma } from '../../../../generated/prisma/client';
import moment from 'moment-timezone';

export class FindAllProblemDocOptions {
  page?: number;
  limit?: number;
  search?: string;
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

  if (options.problemtypeId) {
    where.problemtypeId = Number(options.problemtypeId);
  }

  if (options.sourcetypeId) {
    where.sourcetypeId = Number(options.sourcetypeId);
  }

  if (user.roleId === 4) {
    where.provinceId = user.provinceId ? Number(user.provinceId) : undefined;
    if (options.districtId) {
      where.districtId = Number(options.districtId);
    }
    if (options.villageId) {
      where.villageId = Number(options.villageId);
    }
  } else if (user.roleId === 5) {
    where.provinceId = user.provinceId ? Number(user.provinceId) : undefined;
    where.districtId = user.districtId ? Number(user.districtId) : undefined;
    if (options.villageId) {
      where.villageId = Number(options.villageId);
    }
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
    problemtype: true,
    sourcetype: true,
    problemstatus: true,
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
