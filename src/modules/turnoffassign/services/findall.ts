import { BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import moment from 'moment-timezone';
import { Prisma } from '../../../../generated/prisma/client';

export async function FindAllTurnoffAssign(
  prisma: PrismaService,
  userAppId: number,
  page?: number,
  limit?: number,
) {
  const numericUserAppId = Number(userAppId);
  if (!userAppId || isNaN(numericUserAppId)) {
    throw new BadRequestException(
      'userAppId is required and must be a valid number',
    );
  }

  const where: Prisma.TurnoffAssignWhereInput = {
    userAppId: numericUserAppId,
  };

  if (page !== undefined && limit !== undefined) {
    const skip = (page - 1) * limit;
    const take = limit;

    const [data, total] = await Promise.all([
      prisma.turnoffAssign.findMany({
        where,
        orderBy: [
          {
            turnoff: {
              startDate: 'desc',
            },
          },
          {
            turnoff: {
              startTime: 'desc',
            },
          },
        ],
        include: {
          turnoff: {
            include: {
              province: true,
              district: true,
              voltage: true,
              turnoffStatus: true,
            },
          },
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
        turnoff: turnoffAssign.turnoff
          ? {
              ...turnoffAssign.turnoff,
              startDate: moment(turnoffAssign.turnoff.startDate).format(
                'YYYY-MM-DD',
              ),
              endDate: moment(turnoffAssign.turnoff.endDate).format(
                'YYYY-MM-DD',
              ),
            }
          : null,
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
    orderBy: [
      {
        turnoff: {
          startDate: 'desc',
        },
      },
      {
        turnoff: {
          startTime: 'desc',
        },
      },
    ],
    include: {
      turnoff: {
        include: {
          province: true,
          district: true,
          voltage: true,
          turnoffStatus: true,
        },
      },
    },
  });

  return turnoffAssigns.map((turnoffAssign) => {
    return {
      ...turnoffAssign,
      createdAt: moment(turnoffAssign.createdAt).tz('Asia/Vientiane').format(),
      updatedAt: moment(turnoffAssign.updatedAt).tz('Asia/Vientiane').format(),
      turnoff: turnoffAssign.turnoff
        ? {
            ...turnoffAssign.turnoff,
            startDate: moment(turnoffAssign.turnoff.startDate).format(
              'YYYY-MM-DD',
            ),
            endDate: moment(turnoffAssign.turnoff.endDate).format('YYYY-MM-DD'),
          }
        : null,
    };
  });
}
