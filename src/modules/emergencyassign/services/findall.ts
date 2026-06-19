import { PrismaService } from '../../../prisma/prisma.service';
import moment from 'moment-timezone';

export async function FindAllEmergencyAssign(
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
      prisma.emergencyAssign.findMany({
        where,
        orderBy: {
          emergency: {
            id: 'desc',
          },
        },
        include: {
          emergency: true,
        },
        skip,
        take,
      }),
      prisma.emergencyAssign.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    const mappedData = data.map((emergencyAssign) => {
      return {
        ...emergencyAssign,
        createdAt: moment(emergencyAssign.createdAt)
          .tz('Asia/Vientiane')
          .format(),
        updatedAt: moment(emergencyAssign.updatedAt)
          .tz('Asia/Vientiane')
          .format(),
        emergency: {
          ...emergencyAssign.emergency,
          emergencyDate: moment(emergencyAssign.emergency.emergencyDate).format(
            'YYYY-MM-DD',
          ),
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

  const emergencyAssigns = await prisma.emergencyAssign.findMany({
    where,
    orderBy: {
      emergency: {
        id: 'desc',
      },
    },
    include: {
      emergency: true,
    },
  });

  return emergencyAssigns.map((emergencyAssign) => {
    return {
      ...emergencyAssign,
      createdAt: moment(emergencyAssign.createdAt)
        .tz('Asia/Vientiane')
        .format(),
      updatedAt: moment(emergencyAssign.updatedAt)
        .tz('Asia/Vientiane')
        .format(),
      emergency: {
        ...emergencyAssign.emergency,
        emergencyDate: moment(emergencyAssign.emergency.emergencyDate).format(
          'YYYY-MM-DD',
        ),
      },
    };
  });
}
