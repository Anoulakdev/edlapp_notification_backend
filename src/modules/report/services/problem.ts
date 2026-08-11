import { PrismaService } from '../../../prisma/prisma.service';
import { AuthUser } from '../../../interfaces/auth-user.interface';
import { Prisma } from '../../../../generated/prisma/client';
import moment from 'moment-timezone';

export class ProblemOptions {
  page?: number;
  limit?: number;
  startDate?: string;
  endDate?: string;
  problemstatusId?: number;
  problemtypeId?: number;
  sourcetypeId?: number;
  provinceId?: number;
  districtId?: number;
  villageId?: number;
}

export async function problemReport(
  prisma: PrismaService,
  user: AuthUser,
  options: ProblemOptions = {},
) {
  const where: Prisma.ProblemDocWhereInput = {};

  if (options.startDate || options.endDate) {
    const dateFilter: Prisma.DateTimeFilter = {};
    if (options.startDate) {
      dateFilter.gte = moment
        .tz(options.startDate, 'Asia/Vientiane')
        .startOf('day')
        .toDate();
    }
    if (options.endDate) {
      dateFilter.lte = moment
        .tz(options.endDate, 'Asia/Vientiane')
        .endOf('day')
        .toDate();
    }
    where.createdAt = dateFilter;
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
    problemAssigns: {
      select: {
        id: true,
        sendTime: true,
        receiveTime: true,
        activeTime: true,
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
          id: 'asc',
        },
        include,
        skip,
        take,
      }),
      prisma.problemDoc.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    const mappedData = data.map((problemDoc) => {
      const sendTime = Number(problemDoc.problemAssigns?.sendTime || 0);
      const receiveTime = Number(problemDoc.problemAssigns?.receiveTime || 0);
      const activeTime = Number(problemDoc.problemAssigns?.activeTime || 0);
      const totalTime = sendTime + receiveTime + activeTime;

      const { problemAssigns, ...rest } = problemDoc;

      return {
        ...rest,
        totalTime,
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
      id: 'asc',
    },
    include,
  });

  return problems.map((problemDoc) => {
    const sendTime = Number(problemDoc.problemAssigns?.sendTime || 0);
    const receiveTime = Number(problemDoc.problemAssigns?.receiveTime || 0);
    const activeTime = Number(problemDoc.problemAssigns?.activeTime || 0);
    const totalTime = sendTime + receiveTime + activeTime;

    const { problemAssigns, ...rest } = problemDoc;

    return {
      ...rest,
      totalTime,
      createdAt: moment(problemDoc.createdAt).tz('Asia/Vientiane').format(),
      updatedAt: moment(problemDoc.updatedAt).tz('Asia/Vientiane').format(),
    };
  });
}
