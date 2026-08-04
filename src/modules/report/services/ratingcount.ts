import { PrismaService } from '../../../prisma/prisma.service';
import { AuthUser } from '../../../interfaces/auth-user.interface';
import { Prisma } from '../../../../generated/prisma/client';
import moment from 'moment-timezone';

export class RatingCountOptions {
  startDate?: string;
  endDate?: string;
}

export async function ratingCountReport(
  prisma: PrismaService,
  user: AuthUser,
  options: RatingCountOptions = {},
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

  const agentRatings = await prisma.agentRating.findMany({
    where,
    include: {
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
    },
    orderBy: {
      agentId: 'asc',
    },
  });

  const agentStatsMap = new Map<
    number,
    {
      agentId: number;
      agent: any;
      rating1: number;
      rating2: number;
      rating3: number;
      rating4: number;
      rating5: number;
      totalRatings: number;
      sumRatings: number;
    }
  >();

  for (const item of agentRatings) {
    let stats = agentStatsMap.get(item.agentId);
    if (!stats) {
      stats = {
        agentId: item.agentId,
        agent: item.agent,
        rating1: 0,
        rating2: 0,
        rating3: 0,
        rating4: 0,
        rating5: 0,
        totalRatings: 0,
        sumRatings: 0,
      };
      agentStatsMap.set(item.agentId, stats);
    }

    const rating = item.rating;
    if (rating === 1) stats.rating1 += 1;
    else if (rating === 2) stats.rating2 += 1;
    else if (rating === 3) stats.rating3 += 1;
    else if (rating === 4) stats.rating4 += 1;
    else if (rating === 5) stats.rating5 += 1;

    stats.totalRatings += 1;
    stats.sumRatings += rating;
  }

  const resultList = Array.from(agentStatsMap.values()).map((stats) => {
    const averageRating =
      stats.totalRatings > 0
        ? Number((stats.sumRatings / stats.totalRatings).toFixed(2))
        : 0;

    return {
      agentId: stats.agentId,
      agent: stats.agent,
      rating1: stats.rating1,
      rating2: stats.rating2,
      rating3: stats.rating3,
      rating4: stats.rating4,
      rating5: stats.rating5,
      totalRatings: stats.totalRatings,
      averageRating,
    };
  });

  resultList.sort((a, b) => a.agentId - b.agentId);

  return resultList;
}
