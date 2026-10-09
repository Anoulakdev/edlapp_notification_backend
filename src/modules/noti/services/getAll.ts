import { PrismaService } from '../../../prisma/prisma.service';
import moment from 'moment-timezone';

export async function FindDocumentAll(
  prisma: PrismaService,
  provinceId?: number,
  districtId?: number,
  villageId?: number,
  typeNoti?: number,
  page?: number,
  limit?: number,
) {
  const notiType = typeNoti !== undefined ? Number(typeNoti) : undefined;
  const hasPagination = page !== undefined && limit !== undefined;
  const pageNum = Number(page) || 1;
  const limitNum = Number(limit) || 10;
  const skip = (pageNum - 1) * limitNum;
  const take = limitNum;

  // typeNoti = 1: TurnoffAddress
  if (notiType === 1) {
    const where: any = {};
    if (villageId) {
      where.villageId = Number(villageId);
    }
    if (provinceId || districtId) {
      where.turnoff = {};
      if (provinceId) where.turnoff.provinceId = Number(provinceId);
      if (districtId) where.turnoff.districtId = Number(districtId);
    }

    if (hasPagination) {
      const [data, total] = await Promise.all([
        prisma.turnoffAddress.findMany({
          where,
          orderBy: {
            turnoff: {
              id: 'desc',
            },
          },
          include: {
            turnoff: true,
          },
          skip,
          take,
        }),
        prisma.turnoffAddress.count({ where }),
      ]);

      const totalPages = Math.ceil(total / limitNum);

      const mappedData = data.map((item) => ({
        ...item,
        createdAt: moment(item.createdAt).tz('Asia/Vientiane').format(),
        updatedAt: moment(item.updatedAt).tz('Asia/Vientiane').format(),
        turnoff: item.turnoff
          ? {
              ...item.turnoff,
              startDate: item.turnoff.startDate
                ? moment(item.turnoff.startDate).format('YYYY-MM-DD')
                : null,
              endDate: item.turnoff.endDate
                ? moment(item.turnoff.endDate).format('YYYY-MM-DD')
                : null,
            }
          : null,
      }));

      return {
        data: mappedData,
        total,
        page: pageNum,
        limit: limitNum,
        totalPages,
      };
    }

    const data = await prisma.turnoffAddress.findMany({
      where,
      orderBy: {
        turnoff: {
          id: 'desc',
        },
      },
      include: {
        turnoff: true,
      },
    });

    return data.map((item) => ({
      ...item,
      createdAt: moment(item.createdAt).tz('Asia/Vientiane').format(),
      updatedAt: moment(item.updatedAt).tz('Asia/Vientiane').format(),
      turnoff: item.turnoff
        ? {
            ...item.turnoff,
            startDate: item.turnoff.startDate
              ? moment(item.turnoff.startDate).format('YYYY-MM-DD')
              : null,
            endDate: item.turnoff.endDate
              ? moment(item.turnoff.endDate).format('YYYY-MM-DD')
              : null,
          }
        : null,
    }));
  }

  // typeNoti = 2: EmergencyAddress
  if (notiType === 2) {
    const where: any = {};
    if (villageId) {
      where.villageId = Number(villageId);
    }
    if (provinceId || districtId) {
      where.emergency = {};
      if (provinceId) where.emergency.provinceId = Number(provinceId);
      if (districtId) where.emergency.districtId = Number(districtId);
    }

    if (hasPagination) {
      const [data, total] = await Promise.all([
        prisma.emergencyAddress.findMany({
          where,
          orderBy: {
            emergency: {
              id: 'desc',
            },
          },
          include: {
            emergency: true,
          },
          skip,
          take,
        }),
        prisma.emergencyAddress.count({ where }),
      ]);

      const totalPages = Math.ceil(total / limitNum);

      const mappedData = data.map((item) => ({
        ...item,
        createdAt: moment(item.createdAt).tz('Asia/Vientiane').format(),
        updatedAt: moment(item.updatedAt).tz('Asia/Vientiane').format(),
        emergency: item.emergency
          ? {
              ...item.emergency,
              emergencyDate: item.emergency.emergencyDate
                ? moment(item.emergency.emergencyDate)
                    .tz('Asia/Vientiane')
                    .format('YYYY-MM-DD')
                : null,
            }
          : null,
      }));

      return {
        data: mappedData,
        total,
        page: pageNum,
        limit: limitNum,
        totalPages,
      };
    }

    const data = await prisma.emergencyAddress.findMany({
      where,
      orderBy: {
        emergency: {
          id: 'desc',
        },
      },
      include: {
        emergency: true,
      },
    });

    return data.map((item) => ({
      ...item,
      createdAt: moment(item.createdAt).tz('Asia/Vientiane').format(),
      updatedAt: moment(item.updatedAt).tz('Asia/Vientiane').format(),
      emergency: item.emergency
        ? {
            ...item.emergency,
            emergencyDate: item.emergency.emergencyDate
              ? moment(item.emergency.emergencyDate)
                  .tz('Asia/Vientiane')
                  .format('YYYY-MM-DD')
              : null,
          }
        : null,
    }));
  }

  // typeNoti = 3: CutpowerAddress
  if (notiType === 3) {
    const where: any = {};
    if (villageId) {
      where.villageId = Number(villageId);
    }
    if (provinceId || districtId) {
      where.cutpower = {};
      if (provinceId) where.cutpower.provinceId = Number(provinceId);
      if (districtId) where.cutpower.districtId = Number(districtId);
    }

    if (hasPagination) {
      const [data, total] = await Promise.all([
        prisma.cutpowerAddress.findMany({
          where,
          orderBy: {
            cutpower: {
              id: 'desc',
            },
          },
          include: {
            cutpower: true,
          },
          skip,
          take,
        }),
        prisma.cutpowerAddress.count({ where }),
      ]);

      const totalPages = Math.ceil(total / limitNum);

      const mappedData = data.map((item) => ({
        ...item,
        createdAt: moment(item.createdAt).tz('Asia/Vientiane').format(),
        updatedAt: moment(item.updatedAt).tz('Asia/Vientiane').format(),
        cutpower: item.cutpower
          ? {
              ...item.cutpower,
              cutpowerDate: item.cutpower.cutpowerDate
                ? moment(item.cutpower.cutpowerDate)
                    .tz('Asia/Vientiane')
                    .format('YYYY-MM-DD')
                : null,
            }
          : null,
      }));

      return {
        data: mappedData,
        total,
        page: pageNum,
        limit: limitNum,
        totalPages,
      };
    }

    const data = await prisma.cutpowerAddress.findMany({
      where,
      orderBy: {
        cutpower: {
          id: 'desc',
        },
      },
      include: {
        cutpower: true,
      },
    });

    return data.map((item) => ({
      ...item,
      createdAt: moment(item.createdAt).tz('Asia/Vientiane').format(),
      updatedAt: moment(item.updatedAt).tz('Asia/Vientiane').format(),
      cutpower: item.cutpower
        ? {
            ...item.cutpower,
            cutpowerDate: item.cutpower.cutpowerDate
              ? moment(item.cutpower.cutpowerDate)
                  .tz('Asia/Vientiane')
                  .format('YYYY-MM-DD')
              : null,
          }
        : null,
    }));
  }

  // Fallback: If typeNoti is not specified (return all 3)
  const whereTurnoff: any = {};
  const whereEmergency: any = {};
  const whereCutpower: any = {};

  if (villageId) {
    const vId = Number(villageId);
    whereTurnoff.villageId = vId;
    whereEmergency.villageId = vId;
    whereCutpower.villageId = vId;
  }
  if (provinceId || districtId) {
    const pId = provinceId ? Number(provinceId) : undefined;
    const dId = districtId ? Number(districtId) : undefined;
    if (pId) {
      whereTurnoff.turnoff = { ...(whereTurnoff.turnoff || {}), provinceId: pId };
      whereEmergency.emergency = { ...(whereEmergency.emergency || {}), provinceId: pId };
      whereCutpower.cutpower = { ...(whereCutpower.cutpower || {}), provinceId: pId };
    }
    if (dId) {
      whereTurnoff.turnoff = { ...(whereTurnoff.turnoff || {}), districtId: dId };
      whereEmergency.emergency = { ...(whereEmergency.emergency || {}), districtId: dId };
      whereCutpower.cutpower = { ...(whereCutpower.cutpower || {}), districtId: dId };
    }
  }

  const [turnoffAddresses, emergencyAddresses, cutpowerAddresses] =
    await Promise.all([
      prisma.turnoffAddress.findMany({
        where: whereTurnoff,
        orderBy: {
          turnoff: {
            id: 'desc',
          },
        },
        include: {
          turnoff: true,
        },
        ...(hasPagination ? { skip, take } : {}),
      }),
      prisma.emergencyAddress.findMany({
        where: whereEmergency,
        orderBy: {
          emergency: {
            id: 'desc',
          },
        },
        include: {
          emergency: true,
        },
        ...(hasPagination ? { skip, take } : {}),
      }),
      prisma.cutpowerAddress.findMany({
        where: whereCutpower,
        orderBy: {
          cutpower: {
            id: 'desc',
          },
        },
        include: {
          cutpower: true,
        },
        ...(hasPagination ? { skip, take } : {}),
      }),
    ]);

  const mappedTurnoff = turnoffAddresses.map((item) => ({
    ...item,
    createdAt: moment(item.createdAt).tz('Asia/Vientiane').format(),
    updatedAt: moment(item.updatedAt).tz('Asia/Vientiane').format(),
    turnoff: item.turnoff
      ? {
          ...item.turnoff,
          startDate: item.turnoff.startDate
            ? moment(item.turnoff.startDate).format('YYYY-MM-DD')
            : null,
          endDate: item.turnoff.endDate
            ? moment(item.turnoff.endDate).format('YYYY-MM-DD')
            : null,
        }
      : null,
  }));

  const mappedEmergency = emergencyAddresses.map((item) => ({
    ...item,
    createdAt: moment(item.createdAt).tz('Asia/Vientiane').format(),
    updatedAt: moment(item.updatedAt).tz('Asia/Vientiane').format(),
    emergency: item.emergency
      ? {
          ...item.emergency,
          emergencyDate: item.emergency.emergencyDate
            ? moment(item.emergency.emergencyDate)
                .tz('Asia/Vientiane')
                .format('YYYY-MM-DD')
            : null,
        }
      : null,
  }));

  const mappedCutpower = cutpowerAddresses.map((item) => ({
    ...item,
    createdAt: moment(item.createdAt).tz('Asia/Vientiane').format(),
    updatedAt: moment(item.updatedAt).tz('Asia/Vientiane').format(),
    cutpower: item.cutpower
      ? {
          ...item.cutpower,
          cutpowerDate: item.cutpower.cutpowerDate
            ? moment(item.cutpower.cutpowerDate)
                .tz('Asia/Vientiane')
                .format('YYYY-MM-DD')
            : null,
        }
      : null,
  }));

  return {
    turnoffAddresses: mappedTurnoff,
    emergencyAddresses: mappedEmergency,
    cutpowerAddresses: mappedCutpower,
  };
}
