import { PrismaService } from '../../../prisma/prisma.service';
import { AuthUser } from '../../../interfaces/auth-user.interface';
import { Prisma } from '../../../../generated/prisma/client';

export interface FindAllUserOptions {
  page?: number;
  limit?: number;
  search?: string;
  roleId?: number;
  status?: string;
  isOnline?: boolean | string;
  onlineStatus?: string;
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
  const andFilters: Prisma.UserWhereInput[] = [];

  // Apply role-based visibility restrictions
  if (user.roleId === 1) {
    if (options.roleId !== undefined && options.roleId !== null) {
      where.roleId = Number(options.roleId);
    }
  } else if (user.roleId === 2) {
    const hiddenRoles = [1, 7];
    if (options.roleId !== undefined && options.roleId !== null) {
      const targetRoleId = Number(options.roleId);
      if (!hiddenRoles.includes(targetRoleId)) {
        where.roleId = targetRoleId;
      } else {
        where.roleId = { in: [] };
      }
    } else {
      where.roleId = { notIn: hiddenRoles };
    }
  } else {
    if (options.roleId !== undefined && options.roleId !== null) {
      where.roleId = Number(options.roleId);
    }
  }

  if (options.status) {
    const statusTrim = options.status.toLowerCase().trim();
    if (statusTrim === 'online') {
      where.isOnline = true;
    } else if (statusTrim === 'offline') {
      where.isOnline = false;
    } else {
      let statusValue = options.status;
      if (statusValue === 'Active') statusValue = 'A';
      if (statusValue === 'Inactive') statusValue = 'C';
      where.status = statusValue;
    }
  }

  if (options.isOnline !== undefined && options.isOnline !== null) {
    if (typeof options.isOnline === 'boolean') {
      where.isOnline = options.isOnline;
    } else if (typeof options.isOnline === 'string') {
      const str = options.isOnline.toLowerCase().trim();
      if (str === 'true' || str === 'online' || str === '1') {
        where.isOnline = true;
      } else if (str === 'false' || str === 'offline' || str === '0') {
        where.isOnline = false;
      }
    }
  }

  if (options.onlineStatus) {
    const str = options.onlineStatus.toLowerCase().trim();
    if (str === 'online') {
      where.isOnline = true;
    } else if (str === 'offline') {
      where.isOnline = false;
    }
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
      andFilters.push({
        OR: [
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
        ],
      });
    }
  }

  if (andFilters.length > 0) {
    where.AND = andFilters;
  }

  if (Object.keys(employeeWhere).length > 0) {
    where.employee = {
      ...(where.employee || {}),
      ...employeeWhere,
    } as Prisma.EmployeeWhereInput;
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
    branch: true,
    branchId: true,
    repairDistrict: true,
    repairDistrictId: true,
    isOnline: true,
    lastLoginAt: true,
    lastActiveAt: true,
    createdAt: true,
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

  const mapUser = (u: any) => ({
    ...u,
    isOnline: Boolean(u.isOnline),
    onlineStatus: u.isOnline ? 'online' : 'offline',
    lastLoginAt: u.lastLoginAt,
    lastLoginTimeAgo: formatTimeAgoLao(u.lastLoginAt),
    lastLoginText: formatTimeAgoLao(u.lastLoginAt),
    lastActiveAt: u.lastActiveAt,
    lastActiveTimeAgo: formatTimeAgoLao(u.lastActiveAt),
  });

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
      data: data.map(mapUser),
      total,
      page,
      limit,
      totalPages,
    };
  }

  const users = await prisma.user.findMany({
    where,
    orderBy,
    select,
  });

  return users.map(mapUser);
}

/**
 * ຄິດໄລ່ໄລຍະເວລາທີ່ຜ່ານມາ (Relative Time) ເຊັ່ນ: ນາທີ, ຊົ່ວໂມງ, ມື້, ເດືອນ
 */
export function formatTimeAgoLao(date: Date | string | null | undefined): string {
  if (!date) return 'ບໍ່ເຄີຍເຂົ້າໃຊ້';

  const d = new Date(date);
  if (isNaN(d.getTime())) return 'ບໍ່ເຄີຍເຂົ້າໃຊ້';

  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - d.getTime()) / 1000);

  if (diffInSeconds < 0) return 'ຫາກໍ່ເຂົ້າໃຊ້';
  if (diffInSeconds < 60) return 'ຫາກໍ່ເຂົ້າໃຊ້';

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} ນາທີກ່ອນ`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} ຊົ່ວໂມງກ່ອນ`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) {
    return `${diffInDays} ມື້ກ່ອນ`;
  }

  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) {
    return `${diffInMonths} ເດືອນກ່ອນ`;
  }

  const diffInYears = Math.floor(diffInDays / 365);
  return `${diffInYears} ປີກ່ອນ`;
}
