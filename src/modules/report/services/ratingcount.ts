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

  // Optimize: Use Database-level Group By Aggregation instead of loading all rows into Node.js memory
  const groupedRatings = await prisma.agentRating.groupBy({
    by: ['agentId', 'rating'],
    where,
    _count: {
      _all: true,
    },
  });

  if (!groupedRatings.length) {
    return [];
  }

  const agentIds = Array.from(new Set(groupedRatings.map((g) => g.agentId)));
  const agents = await prisma.user.findMany({
    where: { id: { in: agentIds } },
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
  });

  const agentMap = new Map(agents.map((a) => [a.id, a]));

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

  for (const group of groupedRatings) {
    let stats = agentStatsMap.get(group.agentId);
    if (!stats) {
      stats = {
        agentId: group.agentId,
        agent: agentMap.get(group.agentId) || null,
        rating1: 0,
        rating2: 0,
        rating3: 0,
        rating4: 0,
        rating5: 0,
        totalRatings: 0,
        sumRatings: 0,
      };
      agentStatsMap.set(group.agentId, stats);
    }

    const count = group._count._all || 0;
    const rating = group.rating;
    if (rating === 1) stats.rating1 += count;
    else if (rating === 2) stats.rating2 += count;
    else if (rating === 3) stats.rating3 += count;
    else if (rating === 4) stats.rating4 += count;
    else if (rating === 5) stats.rating5 += count;

    stats.totalRatings += count;
    stats.sumRatings += rating * count;
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
