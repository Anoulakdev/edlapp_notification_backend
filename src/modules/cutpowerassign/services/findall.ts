import { BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import moment from 'moment-timezone';
import { Prisma } from '../../../../generated/prisma/client';

export async function FindAllCutpowerAssign(
  prisma: PrismaService,
  userAppId: number,
  page?: number,
  limit?: number,
) {
  const numericUserAppId = Number(userAppId);
  if (!userAppId || isNaN(numericUserAppId)) {
    throw new BadRequestException('userAppId is required and must be a valid number');
  }

  const where: Prisma.CutpowerAssignWhereInput = {
    userAppId: numericUserAppId,
  };

  if (page !== undefined && limit !== undefined) {
    const skip = (page - 1) * limit;
    const take = limit;

    const [data, total] = await Promise.all([
      prisma.cutpowerAssign.findMany({
        where,
        orderBy: {
          cutpower: {
            cutpowerDate: 'desc',
          },
        },
        include: {
          cutpower: {
            include: {
              province: true,
              district: true,
              voltage: true,
            },
          },
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
        cutpower: cutpowerAssign.cutpower
          ? {
              ...cutpowerAssign.cutpower,
              cutpowerDate: moment(cutpowerAssign.cutpower.cutpowerDate)
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

  const cutpowerAssigns = await prisma.cutpowerAssign.findMany({
    where,
    orderBy: {
      cutpower: {
        cutpowerDate: 'desc',
      },
    },
    include: {
      cutpower: {
        include: {
          province: true,
          district: true,
          voltage: true,
        },
      },
    },
  });

  return cutpowerAssigns.map((cutpowerAssign) => {
    return {
      ...cutpowerAssign,
      createdAt: moment(cutpowerAssign.createdAt).tz('Asia/Vientiane').format(),
      updatedAt: moment(cutpowerAssign.updatedAt).tz('Asia/Vientiane').format(),
      cutpower: cutpowerAssign.cutpower
        ? {
            ...cutpowerAssign.cutpower,
            cutpowerDate: moment(cutpowerAssign.cutpower.cutpowerDate)
              .tz('Asia/Vientiane')
              .format('YYYY-MM-DD'),
          }
        : null,
    };
  });
}
