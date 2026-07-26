import { PrismaService } from '../../../prisma/prisma.service';
import moment from 'moment-timezone';

export async function findAllRepairDistrict(
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
      prisma.repairDistrict.findMany({
        orderBy: {
          branchId: 'asc',
        },
        include: {
          branch: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
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
        skip,
        take,
      }),
      prisma.repairDistrict.count(),
    ]);

    const totalPages = Math.ceil(total / limitNum);

    const mappedData = data.map((repairdistrict) => ({
      ...repairdistrict,
      createdAt: moment(repairdistrict.createdAt).tz('Asia/Vientiane').format(),
      updatedAt: moment(repairdistrict.updatedAt).tz('Asia/Vientiane').format(),
    }));

    return {
      data: mappedData,
      total,
      page: pageNum,
      limit: limitNum,
      totalPages,
    };
  }

  const repairdistricts = await prisma.repairDistrict.findMany({
    orderBy: {
      branchId: 'asc',
    },
    include: {
      branch: {
        select: {
          id: true,
          name: true,
          code: true,
        },
      },
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

  return repairdistricts.map((repairdistrict) => ({
    ...repairdistrict,
    createdAt: moment(repairdistrict.createdAt).tz('Asia/Vientiane').format(),
    updatedAt: moment(repairdistrict.updatedAt).tz('Asia/Vientiane').format(),
  }));
}
