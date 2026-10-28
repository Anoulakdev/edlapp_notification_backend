import { PrismaService } from '../../../prisma/prisma.service';
import { AuthUser } from '../../../interfaces/auth-user.interface';
import { Prisma } from '../../../../generated/prisma/client';
import moment from 'moment-timezone';

export class findAllActivityOptions {
  page?: number;
  limit?: number;
  search?: string;
  startDate?: string;
  endDate?: string;
}

export async function findAllActivity(
  prisma: PrismaService,
  user: AuthUser,
  options: findAllActivityOptions = {},
) {
  const where: Prisma.ActivityWhereInput = {};
  const andFilters: Prisma.ActivityWhereInput[] = [];

  if (options.startDate) {
    where.startDate = {
      gte: moment
        .tz(options.startDate, 'Asia/Vientiane')
        .startOf('day')
        .toDate(),
    };
  }

  if (options.endDate) {
    where.endDate = {
      lte: moment.tz(options.endDate, 'Asia/Vientiane').endOf('day').toDate(),
    };
  }

  if (options.search) {
    const searchLower = options.search.trim();
    if (searchLower) {
      const searchOr: Prisma.ActivityWhereInput[] = [
        { title: { contains: searchLower, mode: 'insensitive' } },
        { content: { contains: searchLower, mode: 'insensitive' } },
        { location: { contains: searchLower, mode: 'insensitive' } },
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
  };

  const mapActivityItem = (activity: any) => ({
    ...activity,
    startDate: moment(activity.startDate)
      .tz('Asia/Vientiane')
      .format('YYYY-MM-DD'),
    endDate: moment(activity.endDate).tz('Asia/Vientiane').format('YYYY-MM-DD'),
    createdAt: moment(activity.createdAt).tz('Asia/Vientiane').format(),
    updatedAt: moment(activity.updatedAt).tz('Asia/Vientiane').format(),
  });

  if (page !== undefined && limit !== undefined) {
    const skip = (page - 1) * limit;
    const take = limit;

    const [data, total] = await Promise.all([
      prisma.activity.findMany({
        where,
        orderBy: {
          startDate: 'desc',
        },
        include,
        skip,
        take,
      }),
      prisma.activity.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data: data.map(mapActivityItem),
      total,
      page,
      limit,
      totalPages,
    };
  }

  const activities = await prisma.activity.findMany({
    where,
    orderBy: {
      startDate: 'desc',
    },
    include,
  });

  return activities.map(mapActivityItem);
}
