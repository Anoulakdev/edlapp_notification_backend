import { PrismaService } from '../../../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';
import moment from 'moment-timezone';

export async function findOneActivity(prisma: PrismaService, id: number) {
  const activity = await prisma.activity.findUnique({
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

  if (!activity) throw new NotFoundException('activity not found');

  return {
    ...activity,
    startDate: moment(activity.startDate).format('YYYY-MM-DD'),
    endDate: moment(activity.endDate).format('YYYY-MM-DD'),
    createdAt: moment(activity.createdAt).tz('Asia/Vientiane').format(),
    updatedAt: moment(activity.updatedAt).tz('Asia/Vientiane').format(),
  };
}
