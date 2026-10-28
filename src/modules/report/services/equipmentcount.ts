import { PrismaService } from '../../../prisma/prisma.service';
import { AuthUser } from '../../../interfaces/auth-user.interface';
import { Prisma } from '../../../../generated/prisma/client';
import moment from 'moment-timezone';

export class EquipmentCountOptions {
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

export async function equipmentCountReport(
  prisma: PrismaService,
  user: AuthUser,
  options: EquipmentCountOptions = {},
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

  // Database-level group by aggregation for equipment usage summary
  const groupedByEquipment = await prisma.problemEquipment.groupBy({
    by: ['equipmentId'],
    where,
    _sum: {
      amount: true,
    },
    _count: {
      _all: true,
    },
  });

  if (!groupedByEquipment.length) {
    return [];
  }

  const equipmentIds = groupedByEquipment.map((g) => g.equipmentId);
  const equipmentList = await prisma.equipment.findMany({
    where: { id: { in: equipmentIds } },
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
  });

  const equipmentMap = new Map(equipmentList.map((e) => [e.id, e]));

  const summary = groupedByEquipment.map((g) => {
    const eq = equipmentMap.get(g.equipmentId);
    return {
      equipmentId: g.equipmentId,
      equipmentName: eq?.name || '',
      unit: eq?.unit || '',
      branchId: eq?.branchId || null,
      branchName: eq?.branch?.name || '',
      totalAmount: g._sum.amount || 0,
      timesUsed: g._count._all || 0,
    };
  });

  summary.sort((a, b) => b.totalAmount - a.totalAmount);

  return summary;
}

