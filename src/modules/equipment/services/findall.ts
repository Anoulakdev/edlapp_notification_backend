import { PrismaService } from '../../../prisma/prisma.service';
import { Prisma } from '../../../../generated/prisma/client';
import { AuthUser } from '../../../interfaces/auth-user.interface';

export interface FindAllEquipmentOptions {
  page?: number;
  limit?: number;
  search?: string;
}

export async function findAllEquipment(
  prisma: PrismaService,
  user: AuthUser,
  options: FindAllEquipmentOptions = {},
) {
  const where: Prisma.EquipmentWhereInput = {};

  if (user?.branchId) {
    where.branchId = Number(user.branchId);
  }

  if (options.search) {
    const searchTrimmed = options.search.trim();
    if (searchTrimmed) {
      const searchOr: Prisma.EquipmentWhereInput[] = [
        { name: { contains: searchTrimmed, mode: 'insensitive' } },
        { unit: { contains: searchTrimmed, mode: 'insensitive' } },
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

  const orderBy: Prisma.EquipmentOrderByWithRelationInput = {
    id: 'asc',
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
