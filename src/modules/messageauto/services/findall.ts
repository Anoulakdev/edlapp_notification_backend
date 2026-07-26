import { PrismaService } from '../../../prisma/prisma.service';
import moment from 'moment-timezone';

export async function findAllMessageAuto(
  prisma: PrismaService,
  page?: number,
  limit?: number,
) {
  if (page !== undefined && limit !== undefined) {
    const pageNum = Number(page);
    const limitNum = Number(limit);
    const skip = (pageNum - 1) * limitNum;
    const take = limitNum;

    const [data, total] = await Promise.all([
      prisma.messageAuto.findMany({
        orderBy: {
          topicId: 'asc',
        },
        include: {
          topic: {
            select: {
              id: true,
              name: true,
              description: true,
            },
          },
        },
        skip,
        take,
      }),
      prisma.messageAuto.count(),
    ]);

    const totalPages = Math.ceil(total / limitNum);

    const mappedData = data.map((messageauto) => ({
      ...messageauto,
      createdAt: moment(messageauto.createdAt).tz('Asia/Vientiane').format(),
      updatedAt: moment(messageauto.updatedAt).tz('Asia/Vientiane').format(),
    }));

    return {
      data: mappedData,
      total,
      page: pageNum,
      limit: limitNum,
      totalPages,
    };
  }

  const messageautos = await prisma.messageAuto.findMany({
    orderBy: {
      topicId: 'asc',
    },
    include: {
      topic: {
        select: {
          id: true,
          name: true,
          description: true,
        },
      },
    },
  });

  return messageautos.map((messageauto) => ({
    ...messageauto,
    createdAt: moment(messageauto.createdAt).tz('Asia/Vientiane').format(),
    updatedAt: moment(messageauto.updatedAt).tz('Asia/Vientiane').format(),
  }));
}
