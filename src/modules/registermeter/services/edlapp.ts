import { PrismaService } from '../../../prisma/prisma.service';
import moment from 'moment-timezone';
import { Prisma } from '../../../../generated/prisma/client';

export interface RegisterMeterEdlAppOptions {
  page?: number;
  limit?: number;
  meterStatusId?: number;
}

export async function registerMeterEdlApp(
  prisma: PrismaService,
  userAppId: number,
  options: RegisterMeterEdlAppOptions = {},
) {
  const where: Prisma.RegisterMeterWhereInput = {
    createdById: Number(userAppId),
  };

  if (options.meterStatusId !== undefined && options.meterStatusId !== null) {
    where.meterStatusId = Number(options.meterStatusId);
  }

  const page = options.page ? Number(options.page) : undefined;
  const limit = options.limit ? Number(options.limit) : undefined;

  const include = {
    province: true,
    district: true,
    village: true,
    sourcetype: true,
    meterStatus: true,
  };

  if (page !== undefined && limit !== undefined) {
    const skip = (page - 1) * limit;
    const take = limit;

    const [data, total] = await Promise.all([
      prisma.registerMeter.findMany({
        where,
        orderBy: {
          id: 'desc',
        },
        include,
        skip,
        take,
      }),
      prisma.registerMeter.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    const mappedData = data.map((registermeter) => {
      return {
        ...registermeter,
        createdAt: moment(registermeter.createdAt)
          .tz('Asia/Vientiane')
          .format(),
        updatedAt: moment(registermeter.updatedAt)
          .tz('Asia/Vientiane')
          .format(),
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

  const registerMeters = await prisma.registerMeter.findMany({
    where,
    orderBy: {
      id: 'desc',
    },
    include,
  });

  return registerMeters.map((meter) => {
    return {
      ...meter,
      createdAt: moment(meter.createdAt).tz('Asia/Vientiane').format(),
      updatedAt: moment(meter.updatedAt).tz('Asia/Vientiane').format(),
    };
  });
}
