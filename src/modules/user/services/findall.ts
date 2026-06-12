import { PrismaService } from '../../../prisma/prisma.service';
import { AuthUser } from '../../../interfaces/auth-user.interface';
import { Prisma } from '../../../../generated/prisma/client';

export interface FindAllUserOptions {
  page?: number;
  limit?: number;
  search?: string;
  roleId?: number;
  status?: string;
  departmentId?: number;
  divisionId?: number;
  posId?: number;
}

export async function findAllUser(
  prisma: PrismaService,
  user: AuthUser,
  options: FindAllUserOptions = {},
) {
  const where: Prisma.UserWhereInput = {};

  // Apply role-based visibility restrictions
  if (user.roleId === 1) {
    if (options.roleId !== undefined && options.roleId !== null) {
      where.roleId = Number(options.roleId);
    }
  } else if (user.roleId === 2) {
    const allowedRoles = [2, 3];
    if (options.roleId !== undefined && options.roleId !== null) {
      const targetRoleId = Number(options.roleId);
      if (allowedRoles.includes(targetRoleId)) {
        where.roleId = targetRoleId;
      } else {
        where.roleId = { in: [] };
      }
    } else {
      where.roleId = { in: allowedRoles };
    }
  } else if (user.roleId === 4) {
    const allowedRoles = [4, 5];
    if (options.roleId !== undefined && options.roleId !== null) {
      const targetRoleId = Number(options.roleId);
      if (allowedRoles.includes(targetRoleId)) {
        where.roleId = targetRoleId;
      } else {
        where.roleId = { in: [] };
      }
    } else {
      where.roleId = { in: allowedRoles };
    }
  }

  if (options.status) {
    let statusValue = options.status;
    if (statusValue === 'Active') statusValue = 'A';
    if (statusValue === 'Inactive') statusValue = 'C';
    where.status = statusValue;
  }

  const employeeWhere: Prisma.EmployeeWhereInput = {};

  if (options.departmentId !== undefined && options.departmentId !== null) {
    employeeWhere.departmentId = Number(options.departmentId);
  }

  if (options.divisionId !== undefined && options.divisionId !== null) {
    employeeWhere.divisionId = Number(options.divisionId);
  }

  if (options.posId !== undefined && options.posId !== null) {
    employeeWhere.posId = Number(options.posId);
  }

  if (options.search) {
    const searchLower = options.search.trim();
    if (searchLower) {
      where.OR = [
        { username: { contains: searchLower, mode: 'insensitive' } },
        {
          employee: {
            OR: [
              { first_name: { contains: searchLower, mode: 'insensitive' } },
              { last_name: { contains: searchLower, mode: 'insensitive' } },
              { emp_code: { contains: searchLower, mode: 'insensitive' } },
              { tel: { contains: searchLower, mode: 'insensitive' } },
              { email: { contains: searchLower, mode: 'insensitive' } },
            ],
          },
        },
      ];
    }
  }

  if (Object.keys(employeeWhere).length > 0) {
    where.employee = {
      ...((where.employee as Prisma.EmployeeWhereInput) || {}),
      ...employeeWhere,
    };
  }

  const page = options.page ? Number(options.page) : undefined;
  const limit = options.limit ? Number(options.limit) : undefined;

  const select = {
    id: true,
    username: true,
    employeeId: true,
    status: true,
    roleId: true,
    role: true,
    provinceId: true,
    province: true,
    districtId: true,
    district: true,
    employee: {
      include: {
        department: true,
        division: true,
        office: true,
        unit: true,
        position: true,
      },
    },
  };

  const orderBy: Prisma.UserOrderByWithRelationInput[] = [
    { roleId: 'asc' },
    {
      employee: {
        position: {
          poscodeId: 'asc',
        },
      },
    },
    {
      employee: {
        division: {
          division_code: 'asc',
        },
      },
    },
    {
      id: 'asc',
    },
  ];

  if (page !== undefined && limit !== undefined) {
    const skip = (page - 1) * limit;
    const take = limit;

    const [data, total] = await Promise.all([
      prisma.user.findMany({
        where,
        orderBy,
        select,
        skip,
        take,
      }),
      prisma.user.count({ where }),
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

  return prisma.user.findMany({
    where,
    orderBy,
    select,
  });
}
