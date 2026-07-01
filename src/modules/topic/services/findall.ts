import { PrismaService } from '../../../prisma/prisma.service';
import moment from 'moment-timezone';

export async function findAllTopic(prisma: PrismaService) {
  const topics = await prisma.topic.findMany({
    orderBy: {
      id: 'asc',
    },
    include: {
      createdBy: {
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
      },
      conversations: {
        orderBy: {
          id: 'desc',
        },
        take: 1,
        select: {
          id: true,
        },
      },
    },
  });

  return topics.map((topic) => ({
    ...topic,
    createdAt: moment(topic.createdAt).tz('Asia/Vientiane').format(),
    updatedAt: moment(topic.updatedAt).tz('Asia/Vientiane').format(),
  }));
}
