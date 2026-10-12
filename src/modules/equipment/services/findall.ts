import { PrismaService } from '../../../prisma/prisma.service';
import { Prisma } from '../../../../generated/prisma/client';

export interface FindAllEquipmentOptions {
  page?: number;
  limit?: number;
  search?: string;
  typeEquipmentId?: number;
}

export async function findAllEquipment(
  prisma: PrismaService,
  options: FindAllEquipmentOptions = {},
) {
  const where: Prisma.EquipmentWhereInput = {};

  if (options.typeEquipmentId) {
    where.typeEquipmentId = Number(options.typeEquipmentId);
  }

  if (options.search) {
    const searchTrimmed = options.search.trim();
    if (searchTrimmed) {
      const searchOr: Prisma.EquipmentWhereInput[] = [
        { name: { contains: searchTrimmed, mode: 'insensitive' } },
        { typeEquipment: { name: { contains: searchTrimmed, mode: 'insensitive' } } },
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
    typeEquipment: true,
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

  const orderBy: Prisma.EquipmentOrderByWithRelationInput = {
    id: 'desc',
  };

  if (page !== undefined && limit !== undefined) {
    const skip = (page - 1) * limit;
    const take = limit;

    const [data, total] = await Promise.all([
      prisma.equipment.findMany({
        where,
        orderBy,
        include,
        skip,
        take,
      }),
      prisma.equipment.count({ where }),
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

  return prisma.equipment.findMany({
    where,
    orderBy,
    include,
  });
}
