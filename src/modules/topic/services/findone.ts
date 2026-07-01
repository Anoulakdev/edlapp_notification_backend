import { PrismaService } from '../../../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';
import moment from 'moment-timezone';

export async function findOneTopic(prisma: PrismaService, id: number) {
  const topic = await prisma.topic.findUnique({
    where: { id },
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
    },
  });
  if (!topic) throw new NotFoundException('topic not found');
  return {
    ...topic,
    createdAt: moment(topic.createdAt).tz('Asia/Vientiane').format(),
    updatedAt: moment(topic.updatedAt).tz('Asia/Vientiane').format(),
  };
}
