import { PrismaService } from '../../../prisma/prisma.service';
import { AuthUser } from '../../../interfaces/auth-user.interface';
import { BadRequestException, ForbiddenException } from '@nestjs/common';
import moment from 'moment-timezone';

export const LAO_MONTHS = [
  'ມັງກອນ',
  'ກຸມພາ',
  'ມີນາ',
  'ເມສາ',
  'ພຶດສະພາ',
  'ມິຖຸນາ',
  'ກໍລະກົດ',
  'ສິງຫາ',
  'ກັນຍາ',
  'ຕຸລາ',
  'ພະຈິກ',
  'ທັນວາ',
];

export interface MonthlyDocItem {
  monthName: string;
  monthNum: number;
  count: number;
}

export async function dashAll(
  prisma: PrismaService,
  user: AuthUser,
  year: number,
  provinceId?: number,
  districtId?: number,
) {
  // ຮອງຮັບສະເພາະ roleId = 1, 2, 3, 4, 5, 6
  if (![1, 2, 3, 4, 5, 6].includes(user.roleId)) {
    throw new ForbiddenException('Access denied for this role');
  }

  // ບັງຄັບໃຫ້ສົ່ງປີມາ
  if (!year || isNaN(Number(year))) {
    throw new BadRequestException('Year is required');
  }

  const targetYear = Number(year);
  const startOfYear = moment
    .tz(`${targetYear}-01-01`, 'Asia/Vientiane')
    .startOf('year')
    .toDate();
  const endOfYear = moment
    .tz(`${targetYear}-12-31`, 'Asia/Vientiane')
    .endOf('year')
    .toDate();

  const where: any = {
    createdAt: {
      gte: startOfYear,
      lte: endOfYear,
    },
  };

  const andFilters: any[] = [];

  // ເງື່ອນໄຂການກັ່ນຕອງຕາມ Role ຂອງຜູ້ Login
  if (user.roleId === 5) {
    const provinceFilter: any = {
      provinceId: user.provinceId ? Number(user.provinceId) : undefined,
    };
    if (user.provinceId === 1 && user.employee?.divisionId === 185) {
      if (districtId) {
        const targetDistrictId = Number(districtId);
        if ([1, 2, 3, 4].includes(targetDistrictId)) {
          provinceFilter.districtId = targetDistrictId;
        } else {
          provinceFilter.districtId = { in: [] };
        }
      } else {
        provinceFilter.districtId = { in: [1, 2, 3, 4] };
      }
    } else if (user.provinceId === 1 && user.employee?.divisionId === 188) {
      if (districtId) {
        const targetDistrictId = Number(districtId);
        if ([5, 6, 7, 8, 9].includes(targetDistrictId)) {
          provinceFilter.districtId = targetDistrictId;
        } else {
          provinceFilter.districtId = { in: [] };
        }
      } else {
        provinceFilter.districtId = { in: [5, 6, 7, 8, 9] };
      }
    } else {
      if (districtId) {
        provinceFilter.districtId = Number(districtId);
      }
    }
    andFilters.push(provinceFilter);
  } else if (user.roleId === 6) {
    andFilters.push({
      provinceId: user.provinceId ? Number(user.provinceId) : undefined,
      districtId: districtId
        ? Number(districtId)
        : user.districtId
          ? Number(user.districtId)
          : undefined,
    });
  } else {
    // ສຳລັບ roleId = 1, 2, 3, 4 (Super Admin, Admin, Supervisor, Agent)
    if (provinceId) {
      where.provinceId = Number(provinceId);
    }
    if (districtId) {
      where.districtId = Number(districtId);
    }
  }

  if (andFilters.length > 0) {
    where.AND = andFilters;
  }

  // ດຶງຂໍ້ມູນ createdAt ຂອງເອກະສານທັງ 4 ປະເພດພ້ອມກັນ
  const [turnoffs, emergencies, cutpowers, registermeters] = await Promise.all([
    prisma.turnoffDoc.findMany({
      where,
      select: { createdAt: true },
    }),
    prisma.emergencyDoc.findMany({
      where,
      select: { createdAt: true },
    }),
    prisma.cutpowerDoc.findMany({
      where,
      select: { createdAt: true },
    }),
    prisma.registerMeter.findMany({
      where,
      select: { createdAt: true },
    }),
  ]);

  // ສ້າງ array 12 ເດືອນ ທີ່ມີຊື່ເດືອນພາສາລາວແຕ່ລະເດືອນ
  const turnoffDoc: MonthlyDocItem[] = LAO_MONTHS.map((monthName, i) => ({
    monthName,
    monthNum: i + 1,
    count: 0,
  }));

  const emergencyDoc: MonthlyDocItem[] = LAO_MONTHS.map((monthName, i) => ({
    monthName,
    monthNum: i + 1,
    count: 0,
  }));

  const cutpowerDoc: MonthlyDocItem[] = LAO_MONTHS.map((monthName, i) => ({
    monthName,
    monthNum: i + 1,
    count: 0,
  }));

  const registerMeter: MonthlyDocItem[] = LAO_MONTHS.map((monthName, i) => ({
    monthName,
    monthNum: i + 1,
    count: 0,
  }));

  // Helper for ultra-fast Vientiane month calculation (UTC+7) without heavy Moment allocation
  const getVientianeMonth = (dateVal: Date | string): number => {
    const timeMs = typeof dateVal === 'string' ? new Date(dateVal).getTime() : dateVal.getTime();
    return new Date(timeMs + 7 * 3600000).getUTCMonth();
  };

  for (let i = 0; i < turnoffs.length; i++) {
    const m = getVientianeMonth(turnoffs[i].createdAt);
    if (m >= 0 && m < 12) {
      turnoffDoc[m].count++;
    }
  }

  for (let i = 0; i < emergencies.length; i++) {
    const m = getVientianeMonth(emergencies[i].createdAt);
    if (m >= 0 && m < 12) {
      emergencyDoc[m].count++;
    }
  }

  for (let i = 0; i < cutpowers.length; i++) {
    const m = getVientianeMonth(cutpowers[i].createdAt);
    if (m >= 0 && m < 12) {
      cutpowerDoc[m].count++;
    }
  }

  for (let i = 0; i < registermeters.length; i++) {
    const m = getVientianeMonth(registermeters[i].createdAt);
    if (m >= 0 && m < 12) {
      registerMeter[m].count++;
    }
  }

  return {
    year: targetYear,
    turnoffDoc,
    emergencyDoc,
    cutpowerDoc,
    registerMeter,
  };
}
