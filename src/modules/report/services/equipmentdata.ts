import { PrismaService } from '../../../prisma/prisma.service';
import { AuthUser } from '../../../interfaces/auth-user.interface';
import { Prisma } from '../../../../generated/prisma/client';
import moment from 'moment-timezone';

export class EquipmentDataOptions {
  page?: number;
  limit?: number;
  startDate?: string;
  endDate?: string;
  provinceId?: number;
  districtId?: number;
  villageId?: number;
  problemtypeId?: number;
  problemstatusId?: number;
  sourcetypeId?: number;
  voltageId?: number;
  typeRepairId?: number;
}

export async function equipmentDataReport(
  prisma: PrismaService,
  user: AuthUser,
  options: EquipmentDataOptions = {},
) {
  const problemWhere: Prisma.ProblemDocWhereInput = {};

  if (options.startDate || options.endDate) {
    const dateFilter: Prisma.DateTimeFilter = {};
    if (options.startDate) {
      dateFilter.gte = moment
        .tz(options.startDate, 'Asia/Vientiane')
        .startOf('day')
        .toDate();
    }
    if (options.endDate) {
      dateFilter.lte = moment
        .tz(options.endDate, 'Asia/Vientiane')
        .endOf('day')
        .toDate();
    }
    problemWhere.createdAt = dateFilter;
  }

  if (options.problemstatusId) {
    problemWhere.problemstatusId = Number(options.problemstatusId);
  }

  if (options.problemtypeId) {
    problemWhere.problemtypeId = Number(options.problemtypeId);
  }

  if (options.sourcetypeId) {
    problemWhere.sourcetypeId = Number(options.sourcetypeId);
  }

  if (user?.roleId === 5) {
    if (user.branchId) {
      problemWhere.branchId = Number(user.branchId);
    }
    if (options.districtId) {
      problemWhere.districtId = Number(options.districtId);
    }
    if (options.villageId) {
      problemWhere.villageId = Number(options.villageId);
    }
  } else if (user?.roleId === 6) {
    problemWhere.parentProblemId = null;
    if (user.repairDistrictId) {
      problemWhere.repairDistrictId = Number(user.repairDistrictId);
    } else if (user.branchId) {
      problemWhere.branchId = Number(user.branchId);
    } else {
      problemWhere.repairDistrictId = -1;
    }
    if (options.villageId) {
      problemWhere.villageId = Number(options.villageId);
    }
  } else {
    if (options.provinceId) {
      problemWhere.provinceId = Number(options.provinceId);
    }
    if (options.districtId) {
      problemWhere.districtId = Number(options.districtId);
    }
    if (options.villageId) {
      problemWhere.villageId = Number(options.villageId);
    }
  }

  const problemAssignWhere: Prisma.ProblemAssignWhereInput = {
    problem: problemWhere,
  };

  if (options.voltageId) {
    problemAssignWhere.voltageId = Number(options.voltageId);
  }

  if (options.typeRepairId) {
    problemAssignWhere.typeRepairId = Number(options.typeRepairId);
  }

  const where: Prisma.ProblemEquipmentWhereInput = {
    problemAssign: problemAssignWhere,
  };

  const page = options.page ? Number(options.page) : undefined;
  const limit = options.limit ? Number(options.limit) : undefined;

  const include = {
    equipment: {
      select: {
        id: true,
        name: true,
        unit: true,
        branchId: true,
        branch: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    },
    problemAssign: {
      select: {
        id: true,
        activeAt: true,
        activeTime: true,
        voltage: {
          select: {
            id: true,
            name: true,
          },
        },
        typeRepair: {
          select: {
            id: true,
            name: true,
          },
        },
        userActive: {
          select: {
            id: true,
            employee: {
              select: {
                id: true,
                first_name: true,
                last_name: true,
                emp_code: true,
                tel: true,
              },
            },
          },
        },
        problem: {
          select: {
            id: true,
            fullName: true,
            tel: true,
            createdAt: true,
            problemstatusId: true,
            problemstatus: {
              select: {
                id: true,
                callcenter: true,
                edlapp: true,
              },
            },
            problemtype: {
              select: {
                id: true,
                name: true,
              },
            },
            province: {
              select: {
                id: true,
                province_name: true,
              },
            },
            district: {
              select: {
                id: true,
                district_name: true,
              },
            },
            village: {
              select: {
                id: true,
                village_name: true,
              },
            },
            branch: {
              select: {
                id: true,
                name: true,
              },
            },
            repairDistrict: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    },
  };

  const mapItem = (item: any) => ({
    id: item.id,
    amount: item.amount,
    comment: item.comment,
    equipmentId: item.equipmentId,
    equipmentName: item.equipment?.name || '',
    unit: item.equipment?.unit || '',
    equipmentBranch: item.equipment?.branch?.name || '',
    problemAssignId: item.problemAssignId,
    voltage: item.problemAssign?.voltage?.name || '',
    typeRepair: item.problemAssign?.typeRepair?.name || '',
    activeAt: item.problemAssign?.activeAt
      ? moment(item.problemAssign.activeAt).tz('Asia/Vientiane').format()
      : null,
    activeTime: item.problemAssign?.activeTime || 0,
    technician: item.problemAssign?.userActive?.employee
      ? `${item.problemAssign.userActive.employee.first_name || ''} ${item.problemAssign.userActive.employee.last_name || ''}`.trim()
      : '',
    problemId: item.problemAssign?.problem?.id || null,
    problemtype: item.problemAssign?.problem?.problemtype?.name || '',
    customerName: item.problemAssign?.problem?.fullName || '',
    customerTel: item.problemAssign?.problem?.tel || '',
    province: item.problemAssign?.problem?.province?.province_name || '',
    district: item.problemAssign?.problem?.district?.district_name || '',
    village: item.problemAssign?.problem?.village?.village_name || '',
    branch: item.problemAssign?.problem?.branch?.name || '',
    repairDistrict: item.problemAssign?.problem?.repairDistrict?.name || '',
    problemStatus: item.problemAssign?.problem?.problemstatus?.callcenter || '',
    createdAt: item.problemAssign?.problem?.createdAt
      ? moment(item.problemAssign.problem.createdAt)
          .tz('Asia/Vientiane')
          .format()
      : null,
  });

  if (page !== undefined && limit !== undefined) {
    const skip = (page - 1) * limit;
    const take = limit;

    const [data, total] = await Promise.all([
      prisma.problemEquipment.findMany({
        where,
        orderBy: [
          {
            problemAssign: {
              problem: {
                createdAt: 'asc',
              },
            },
          },
          {
            id: 'asc',
          },
        ],
        include,
        skip,
        take,
      }),
      prisma.problemEquipment.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data: data.map(mapItem),
      total,
      page,
      limit,
      totalPages,
    };
  }

  const data = await prisma.problemEquipment.findMany({
    where,
    orderBy: [
      {
        problemAssign: {
          problem: {
            createdAt: 'asc',
          },
        },
      },
      {
        id: 'asc',
      },
    ],
    include,
  });

  return data.map(mapItem);
}
