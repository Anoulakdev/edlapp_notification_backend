import { PrismaService } from '../../../prisma/prisma.service';
import { AuthUser } from '../../../interfaces/auth-user.interface';
import { Prisma } from '../../../../generated/prisma/client';
import moment from 'moment-timezone';

export class RatingDataOptions {
  page?: number;
  limit?: number;
  startDate?: string;
  endDate?: string;
}

export async function ratingDataReport(
  prisma: PrismaService,
  user: AuthUser,
  options: RatingDataOptions = {},
) {
  const where: Prisma.AgentRatingWhereInput = {};

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

  const page = options.page ? Number(options.page) : undefined;
  const limit = options.limit ? Number(options.limit) : undefined;

  const include = {
    agent: {
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
    externalUser: true,
    topic: {
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
      prisma.agentRating.findMany({
        where,
        orderBy: {
          id: 'asc',
        },
        include,
        skip,
        take,
      }),
      prisma.agentRating.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    const mappedData = data.map((item) => {
      return {
        ...item,
        createdAt: moment(item.createdAt).tz('Asia/Vientiane').format(),
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

  const agentRatings = await prisma.agentRating.findMany({
    where,
    orderBy: {
      id: 'asc',
    },
    include,
  });

  return agentRatings.map((item) => {
    return {
      ...item,
      createdAt: moment(item.createdAt).tz('Asia/Vientiane').format(),
    };
  });
}
