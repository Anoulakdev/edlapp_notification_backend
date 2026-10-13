import { BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import moment from 'moment-timezone';
import { Prisma } from '../../../../generated/prisma/client';

export async function FindAllEmergencyAssign(
  prisma: PrismaService,
  userAppId: number,
  page?: number,
  limit?: number,
) {
  const numericUserAppId = Number(userAppId);
  if (!userAppId || isNaN(numericUserAppId)) {
    throw new BadRequestException('userAppId is required and must be a valid number');
  }

  const where: Prisma.EmergencyAssignWhereInput = {
    userAppId: numericUserAppId,
  };

  if (page !== undefined && limit !== undefined) {
    const skip = (page - 1) * limit;
    const take = limit;

    const [data, total] = await Promise.all([
      prisma.emergencyAssign.findMany({
        where,
        orderBy: [
          {
            emergency: {
              emergencyDate: 'desc',
            },
          },
          {
            emergency: {
              startTime: 'desc',
            },
          },
        ],
        include: {
          emergency: {
            include: {
              province: true,
              district: true,
              voltage: true,
              emergencyStatus: true,
            },
          },
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
        emergency: emergencyAssign.emergency
          ? {
              ...emergencyAssign.emergency,
              emergencyDate: moment(emergencyAssign.emergency.emergencyDate)
                .tz('Asia/Vientiane')
                .format('YYYY-MM-DD'),
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

  const emergencyAssigns = await prisma.emergencyAssign.findMany({
    where,
    orderBy: [
      {
        emergency: {
          emergencyDate: 'desc',
        },
      },
      {
        emergency: {
          startTime: 'desc',
        },
      },
    ],
    include: {
      emergency: {
        include: {
          province: true,
          district: true,
          voltage: true,
          emergencyStatus: true,
        },
      },
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
      emergency: emergencyAssign.emergency
        ? {
            ...emergencyAssign.emergency,
            emergencyDate: moment(emergencyAssign.emergency.emergencyDate)
              .tz('Asia/Vientiane')
              .format('YYYY-MM-DD'),
          }
        : null,
    };
  });
}
