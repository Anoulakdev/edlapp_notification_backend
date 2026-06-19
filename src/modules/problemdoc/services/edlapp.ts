import { PrismaService } from '../../../prisma/prisma.service';
import moment from 'moment-timezone';
import { Prisma } from '../../../../generated/prisma/client';

export interface ProblemDocEdlAppOptions {
  page?: number;
  limit?: number;
  problemstatusId?: number;
}

export async function problemDocEdlApp(
  prisma: PrismaService,
  userAppId: number,
  options: ProblemDocEdlAppOptions = {},
) {
  const where: Prisma.ProblemDocWhereInput = {
    createdById: Number(userAppId),
  };

  if (
    options.problemstatusId !== undefined &&
    options.problemstatusId !== null
  ) {
    where.problemstatusId = Number(options.problemstatusId);
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

    const mappedData = data.map((problem) => {
      return {
        ...problem,
        createdAt: moment(problem.createdAt).tz('Asia/Vientiane').format(),
        updatedAt: moment(problem.updatedAt).tz('Asia/Vientiane').format(),
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
