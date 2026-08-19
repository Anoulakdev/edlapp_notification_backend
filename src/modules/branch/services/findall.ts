import { PrismaService } from '../../../prisma/prisma.service';
import moment from 'moment-timezone';

export async function findAllBranch(prisma: PrismaService) {
  const branchs = await prisma.branch.findMany({
    orderBy: {
      code: 'asc',
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
      repairDistricts: {
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

  return branchs.map((branch) => ({
    ...branch,
    createdAt: moment(branch.createdAt).tz('Asia/Vientiane').format(),
    updatedAt: moment(branch.updatedAt).tz('Asia/Vientiane').format(),
  }));
}
