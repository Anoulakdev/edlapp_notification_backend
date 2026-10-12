import { PrismaService } from '../../../prisma/prisma.service';
import { Prisma } from '../../../../generated/prisma/client';

export interface FindAllVillageOptions {
  page?: number;
  limit?: number;
  search?: string;
  districtCode?: string;
}

export async function findAllVillage(
  prisma: PrismaService,
  options: FindAllVillageOptions = {},
) {
  const where: Prisma.VillageWhereInput = {};

  if (options.districtCode) {
    where.districtCode = options.districtCode;
  }

  if (options.search) {
    const searchTrimmed = options.search.trim();
    if (searchTrimmed) {
      where.village_name = {
        contains: searchTrimmed,
        mode: 'insensitive',
      };
    }
  }

  const page = options.page ? Number(options.page) : undefined;
  const limit = options.limit ? Number(options.limit) : undefined;

  const include = {
    district: true,
  };

  const orderBy: Prisma.VillageOrderByWithRelationInput = {
    districtCode: 'asc',
  };

  if (page !== undefined && limit !== undefined) {
    const skip = (page - 1) * limit;
    const take = limit;

    const [data, total] = await Promise.all([
      prisma.village.findMany({
        where,
        orderBy,
        include,
        skip,
        take,
      }),
      prisma.village.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data,
      total,
      page,
      limit,
      totalPages,
    };
  }

  return prisma.village.findMany({
    where,
    orderBy,
    include,
  });
}
