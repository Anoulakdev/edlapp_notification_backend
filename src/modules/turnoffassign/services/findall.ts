import { PrismaService } from '../../../prisma/prisma.service';
import moment from 'moment-timezone';

export async function FindAllTurnoffAssign(
  prisma: PrismaService,
  userAppId: number,
  page?: number,
  limit?: number,
) {
  const where = { userAppId: Number(userAppId) };

  if (page !== undefined && limit !== undefined) {
    const skip = (page - 1) * limit;
    const take = limit;

    const [data, total] = await Promise.all([
      prisma.turnoffAssign.findMany({
        where,
        orderBy: {
          turnoff: {
            id: 'desc',
          },
        },
        include: {
          turnoff: true,
        },
        skip,
        take,
      }),
      prisma.turnoffAssign.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    const mappedData = data.map((turnoffAssign) => {
      return {
        ...turnoffAssign,
        createdAt: moment(turnoffAssign.createdAt)
          .tz('Asia/Vientiane')
          .format(),
        updatedAt: moment(turnoffAssign.updatedAt)
          .tz('Asia/Vientiane')
          .format(),
        turnoff: {
          ...turnoffAssign.turnoff,
          startDate: moment(turnoffAssign.turnoff.startDate).format(
            'YYYY-MM-DD',
          ),
          endDate: moment(turnoffAssign.turnoff.endDate).format('YYYY-MM-DD'),
        },
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

  const turnoffAssigns = await prisma.turnoffAssign.findMany({
    where,
    orderBy: {
      turnoff: {
        id: 'desc',
      },
    },
    include: {
      turnoff: true,
    },
  });

  return turnoffAssigns.map((turnoffAssign) => {
    return {
      ...turnoffAssign,
      createdAt: moment(turnoffAssign.createdAt).tz('Asia/Vientiane').format(),
      updatedAt: moment(turnoffAssign.updatedAt).tz('Asia/Vientiane').format(),
      turnoff: {
        ...turnoffAssign.turnoff,
        startDate: moment(turnoffAssign.turnoff.startDate).format('YYYY-MM-DD'),
        endDate: moment(turnoffAssign.turnoff.endDate).format('YYYY-MM-DD'),
      },
    };
  });
}
