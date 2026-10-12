import { PrismaService } from '../../../prisma/prisma.service';
import { Prisma } from '../../../../generated/prisma/client';
import moment from 'moment-timezone';

export interface FindAllRepairDistrictOptions {
  page?: number;
  limit?: number;
  search?: string;
  branchId?: number;
}

export async function findAllRepairDistrict(
  prisma: PrismaService,
  optionsOrPage?: FindAllRepairDistrictOptions | number,
  limitArg?: number,
) {
  let options: FindAllRepairDistrictOptions = {};
  if (typeof optionsOrPage === 'object' && optionsOrPage !== null) {
    options = optionsOrPage;
  } else {
    options = {
      page: optionsOrPage,
      limit: limitArg,
    };
  }

  const where: Prisma.RepairDistrictWhereInput = {};

  if (options.branchId) {
    where.branchId = Number(options.branchId);
  }

  if (options.search) {
    const searchTrimmed = options.search.trim();
    if (searchTrimmed) {
      const searchOr: Prisma.RepairDistrictWhereInput[] = [
        { name: { contains: searchTrimmed, mode: 'insensitive' } },
        { code: { contains: searchTrimmed, mode: 'insensitive' } },
        { branch: { name: { contains: searchTrimmed, mode: 'insensitive' } } },
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
  };

  const orderBy: Prisma.RepairDistrictOrderByWithRelationInput = {
    id: 'desc',
  };

  const mapRepairDistrict = (repairdistrict: any) => ({
    ...repairdistrict,
    createdAt: moment(repairdistrict.createdAt).tz('Asia/Vientiane').format(),
    updatedAt: moment(repairdistrict.updatedAt).tz('Asia/Vientiane').format(),
  });

  if (page !== undefined && limit !== undefined) {
    const skip = (page - 1) * limit;
    const take = limit;

    const [data, total] = await Promise.all([
      prisma.repairDistrict.findMany({
        where,
        orderBy,
        include,
        skip,
        take,
      }),
      prisma.repairDistrict.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data: data.map(mapRepairDistrict),
      total,
      page,
      limit,
      totalPages,
    };
  }

  const repairdistricts = await prisma.repairDistrict.findMany({
    where,
    orderBy,
    include,
  });

  return repairdistricts.map(mapRepairDistrict);
}
