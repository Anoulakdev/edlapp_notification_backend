import { PrismaService } from '../../../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';
import moment from 'moment-timezone';

export async function findOneBranch(prisma: PrismaService, id: number) {
  const branch = await prisma.branch.findUnique({
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
  if (!branch) throw new NotFoundException('branch not found');
  return {
    ...branch,
    createdAt: moment(branch.createdAt).tz('Asia/Vientiane').format(),
    updatedAt: moment(branch.updatedAt).tz('Asia/Vientiane').format(),
  };
}
