import { PrismaService } from '../../../prisma/prisma.service';
import { Prisma } from '../../../../generated/prisma/client';

export interface FindAllTypeEquipmentOptions {
  page?: number;
  limit?: number;
  search?: string;
}

export async function findAllTypeEquipment(
  prisma: PrismaService,
  options: FindAllTypeEquipmentOptions = {},
) {
  const where: Prisma.TypeEquipmentWhereInput = {};

  if (options.search) {
    const searchTrimmed = options.search.trim();
    if (searchTrimmed) {
      const searchOr: Prisma.TypeEquipmentWhereInput[] = [
        { name: { contains: searchTrimmed, mode: 'insensitive' } },
        { code: { contains: searchTrimmed, mode: 'insensitive' } },
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
    equipments: {
      orderBy: {
        id: 'desc' as const,
      },
      take: 1,
      select: {
        id: true,
      },
    },
  };

  const orderBy: Prisma.TypeEquipmentOrderByWithRelationInput = {
    id: 'desc',
  };

  if (page !== undefined && limit !== undefined) {
    const skip = (page - 1) * limit;
    const take = limit;

    const [data, total] = await Promise.all([
      prisma.typeEquipment.findMany({
        where,
        orderBy,
        include,
        skip,
        take,
      }),
      prisma.typeEquipment.count({ where }),
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

  return prisma.typeEquipment.findMany({
    where,
    orderBy,
    include,
  });
}
