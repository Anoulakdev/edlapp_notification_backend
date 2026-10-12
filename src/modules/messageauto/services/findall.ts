import { PrismaService } from '../../../prisma/prisma.service';
import { Prisma } from '../../../../generated/prisma/client';
import moment from 'moment-timezone';

export interface FindAllMessageAutoOptions {
  page?: number;
  limit?: number;
  search?: string;
  topicId?: number;
}

export async function findAllMessageAuto(
  prisma: PrismaService,
  optionsOrPage?: FindAllMessageAutoOptions | number,
  limitArg?: number,
) {
  let options: FindAllMessageAutoOptions = {};
  if (typeof optionsOrPage === 'object' && optionsOrPage !== null) {
    options = optionsOrPage;
  } else {
    options = {
      page: optionsOrPage,
      limit: limitArg,
    };
  }

  const where: Prisma.MessageAutoWhereInput = {};

  if (options.topicId) {
    where.topicId = Number(options.topicId);
  }

  if (options.search) {
    const searchTrimmed = options.search.trim();
    if (searchTrimmed) {
      const searchOr: Prisma.MessageAutoWhereInput[] = [
        { messageTopic: { contains: searchTrimmed, mode: 'insensitive' } },
        { topic: { name: { contains: searchTrimmed, mode: 'insensitive' } } },
      ];
      const searchNum = Number(searchTrimmed);
      if (!isNaN(searchNum)) {
        searchOr.push({ id: searchNum });
      }
      where.OR = searchOr;
    }
  }

  const page = options.page ? Number(options.page) : undefined;
  const limit = options.limit ? Number(options.limit) : undefined;

  const include = {
    topic: {
      select: {
        id: true,
        name: true,
        description: true,
      },
    },
  };

  const orderBy: Prisma.MessageAutoOrderByWithRelationInput = {
    id: 'desc',
  };

  const mapMessageAuto = (messageauto: any) => ({
    ...messageauto,
    createdAt: moment(messageauto.createdAt).tz('Asia/Vientiane').format(),
    updatedAt: moment(messageauto.updatedAt).tz('Asia/Vientiane').format(),
  });

  if (page !== undefined && limit !== undefined) {
    const skip = (page - 1) * limit;
    const take = limit;

    const [data, total] = await Promise.all([
      prisma.messageAuto.findMany({
        where,
        orderBy,
        include,
        skip,
        take,
      }),
      prisma.messageAuto.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data: data.map(mapMessageAuto),
      total,
      page,
      limit,
      totalPages,
    };
  }

  const messageautos = await prisma.messageAuto.findMany({
    where,
    orderBy,
    include,
  });

  return messageautos.map(mapMessageAuto);
}
