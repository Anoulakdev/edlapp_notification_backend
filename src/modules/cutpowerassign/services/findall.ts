import { PrismaService } from '../../../prisma/prisma.service';
import moment from 'moment-timezone';

export async function FindAllCutpowerAssign(
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
      prisma.cutpowerAssign.findMany({
        where,
        orderBy: {
          cutpower: {
            id: 'desc',
          },
        },
        include: {
          cutpower: true,
        },
        skip,
        take,
      }),
      prisma.cutpowerAssign.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    const mappedData = data.map((cutpowerAssign) => {
      return {
        ...cutpowerAssign,
        createdAt: moment(cutpowerAssign.createdAt)
          .tz('Asia/Vientiane')
          .format(),
        updatedAt: moment(cutpowerAssign.updatedAt)
          .tz('Asia/Vientiane')
          .format(),
        cutpower: {
          ...cutpowerAssign.cutpower,
          cutpowerDate: moment(cutpowerAssign.cutpower.cutpowerDate)
            .tz('Asia/Vientiane')
            .format('YYYY-MM-DD'),
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

  const cutpowerAssigns = await prisma.cutpowerAssign.findMany({
    where,
    orderBy: {
      cutpower: {
        id: 'desc',
      },
    },
    include: {
      cutpower: true,
    },
  });

  return cutpowerAssigns.map((cutpowerAssign) => {
    return {
      ...cutpowerAssign,
      createdAt: moment(cutpowerAssign.createdAt).tz('Asia/Vientiane').format(),
      updatedAt: moment(cutpowerAssign.updatedAt).tz('Asia/Vientiane').format(),
      cutpower: {
        ...cutpowerAssign.cutpower,
        cutpowerDate: moment(cutpowerAssign.cutpower.cutpowerDate)
          .tz('Asia/Vientiane')
          .format('YYYY-MM-DD'),
      },
    };
  });
}
