import { PrismaService } from '../../../prisma/prisma.service';
import { AuthUser } from '../../../interfaces/auth-user.interface';
import { Prisma } from '../../../../generated/prisma/client';
import moment from 'moment-timezone';

export class FindAllProblemDocOptions {
  page?: number;
  limit?: number;
  search?: string;
  problemstatusId?: number;
  problemtypeId?: number;
  sourcetypeId?: number;
  problemDate?: string;
  provinceId?: number;
  districtId?: number;
  villageId?: number;
  parentProblemId?: number;
  filterMyDocs?: boolean;
}

export async function FindAllProblemDoc(
  prisma: PrismaService,
  user: AuthUser,
  options: FindAllProblemDocOptions = {},
) {
  const where: Prisma.ProblemDocWhereInput = {};

  if (options.filterMyDocs) {
    where.createdById = user.id;
  }

  const parseParentId = (val: unknown): number | null => {
    const raw = String(val ?? '').trim().toLowerCase();
    if (!raw || raw === 'null' || raw === '0') return null;
    const num = Number(val);
    return !isNaN(num) && num > 0 ? num : null;
  };

  if (options.parentProblemId !== undefined) {
    where.parentProblemId = parseParentId(options.parentProblemId);
  }

  if (options.problemDate) {
    const parsedDate = moment.tz(options.problemDate, 'Asia/Vientiane');
    if (parsedDate.isValid()) {
      where.createdAt = {
        gte: parsedDate.clone().startOf('day').toDate(),
        lte: parsedDate.clone().endOf('day').toDate(),
      };
    }
  }

  if (options.problemstatusId) {
    where.problemstatusId = Number(options.problemstatusId);
  }

  if (options.problemtypeId) {
    where.problemtypeId = Number(options.problemtypeId);
  }

  if (options.sourcetypeId) {
    where.sourcetypeId = Number(options.sourcetypeId);
  }

  if (user?.roleId === 5) {
    const provinceFilter = where;
    if (user.provinceId) {
      provinceFilter.provinceId = Number(user.provinceId);
    } else if (options.provinceId) {
      provinceFilter.provinceId = Number(options.provinceId);
    }

    if (user.provinceId === 1 && user.employee?.divisionId === 185) {
      if (options.districtId) {
        const targetDistrictId = Number(options.districtId);
        if ([1, 2, 3, 4].includes(targetDistrictId)) {
          provinceFilter.districtId = targetDistrictId;
        } else {
          provinceFilter.districtId = { in: [] };
        }
      } else {
        provinceFilter.districtId = { in: [1, 2, 3, 4] };
      }
    } else if (user.provinceId === 1 && user.employee?.divisionId === 188) {
      if (options.districtId) {
        const targetDistrictId = Number(options.districtId);
        if ([5, 6, 7, 8, 9].includes(targetDistrictId)) {
          provinceFilter.districtId = targetDistrictId;
        } else {
          provinceFilter.districtId = { in: [] };
        }
      } else {
        provinceFilter.districtId = { in: [5, 6, 7, 8, 9] };
      }
    } else {
      if (options.districtId) {
        provinceFilter.districtId = Number(options.districtId);
      }
    }

    if (options.villageId) {
      provinceFilter.villageId = Number(options.villageId);
    }
  } else if (user?.roleId === 6) {
    if (options.parentProblemId !== undefined) {
      where.parentProblemId = parseParentId(options.parentProblemId);
    } else {
      where.parentProblemId = null;
    }

    if (user.repairDistrictId) {
      where.repairDistrictId = Number(user.repairDistrictId);
    } else if (user.branchId) {
      where.branchId = Number(user.branchId);
    } else {
      where.repairDistrictId = -1;
    }

    if (options.villageId) {
      where.villageId = Number(options.villageId);
    }
  } else {
    // roles 2, 3, 4, etc. see all documents, filtered by options if provided
    if (options.provinceId) {
      where.provinceId = Number(options.provinceId);
    }
    if (options.districtId) {
      where.districtId = Number(options.districtId);
    }
    if (options.villageId) {
      where.villageId = Number(options.villageId);
    }
  }

  if (options.search) {
    const searchLower = options.search.trim();
    if (searchLower) {
      const searchOr: Prisma.ProblemDocWhereInput[] = [
        { fullName: { contains: searchLower, mode: 'insensitive' } },
        { description: { contains: searchLower, mode: 'insensitive' } },
        { tel: { contains: searchLower, mode: 'insensitive' } },
      ];
      const searchNum = Number(searchLower);
      if (!isNaN(searchNum)) {
        searchOr.push({ id: searchNum });
      }
      where.OR = searchOr;
    }
  }

  const page = options.page ? Number(options.page) : undefined;
  const limit = options.limit ? Number(options.limit) : undefined;

  const include = {
    province: true,
    district: true,
    village: true,
    problemtype: {
      select: {
        id: true,
        name: true,
      },
    },
    sourcetype: true,
    problemstatus: true,
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
    parentProblem: {
      select: {
        id: true,
        fullName: true,
        tel: true,
      },
    },
    duplicateProblems: {
      select: {
        id: true,
        fullName: true,
        tel: true,
        problemstatusId: true,
      },
    },
    problemAssigns: {
      include: {
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
        userReceiver: {
          select: {
            id: true,
            employee: {
              select: {
                id: true,
                first_name: true,
                last_name: true,
              },
            },
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
              },
            },
          },
        },
        problemEquipments: {
          include: {
            equipment: {
              select: {
                id: true,
                name: true,
                unit: true,
              },
            },
          },
        },
      },
    },
  };

function getDistanceInMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  if (!lat1 || !lon1 || !lat2 || !lon2) return Infinity;
  const R = 6371e3; // metres
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

  const activeProblemsSelect = {
    id: true,
    lat: true,
    lng: true,
    problemstatusId: true,
    problemstatus: {
      select: {
        id: true,
        callcenter: true,
      },
    },
    fullName: true,
    tel: true,
    problemtype: {
      select: {
        id: true,
        name: true,
      },
    },
    village: {
      select: {
        id: true,
        village_name: true,
      },
    },
  };

  const fetchActiveProblemsForCandidates = async (
    rows: Array<{
      lat: number;
      lng: number;
      provinceId: number;
      parentProblemId: number | null;
      problemstatusId: number;
    }>,
  ) => {
    const validCoords = rows.filter(
      (d) =>
        !d.parentProblemId &&
        d.problemstatusId !== 4 &&
        d.problemstatusId !== 5 &&
        d.lat &&
        d.lng,
    );
    if (validCoords.length === 0) return [];

    const targetProvinceIds = Array.from(
      new Set(validCoords.map((d) => d.provinceId).filter(Boolean)),
    );
    const lats = validCoords.map((d) => d.lat);
    const lngs = validCoords.map((d) => d.lng);
    const minLat = Math.min(...lats) - 0.015;
    const maxLat = Math.max(...lats) + 0.015;
    const minLng = Math.min(...lngs) - 0.015;
    const maxLng = Math.max(...lngs) + 0.015;

    return prisma.problemDoc.findMany({
      where: {
        problemstatusId: { in: [2, 3] },
        parentProblemId: null,
        provinceId:
          targetProvinceIds.length > 0 ? { in: targetProvinceIds } : undefined,
        lat: { gte: minLat, lte: maxLat },
        lng: { gte: minLng, lte: maxLng },
      },
      select: activeProblemsSelect,
    });
  };

  const mapProblemWithMeta = (
    problemDoc: any,
    activeProblems: Array<
      Prisma.ProblemDocGetPayload<{ select: typeof activeProblemsSelect }>
    >,
  ) => {
    const isChild = Boolean(problemDoc.parentProblemId);
    const duplicateCount = problemDoc.duplicateProblems?.length || 0;
    const isParent = !isChild && duplicateCount > 0;
    const isMain = !isChild;
    const docType = isChild ? 'child' : isParent ? 'parent' : 'main';

    const shouldFindNearby =
      !isChild &&
      problemDoc.problemstatusId !== 4 &&
      problemDoc.problemstatusId !== 5 &&
      Boolean(problemDoc.lat && problemDoc.lng);

    const nearbyProblems = shouldFindNearby
      ? activeProblems
          .filter((p) => p.id !== problemDoc.id && p.lat && p.lng)
          .map((p) => ({
            id: p.id,
            fullName: p.fullName,
            tel: p.tel,
            problemstatusId: p.problemstatusId,
            problemstatus: p.problemstatus,
            problemtype: p.problemtype,
            village: p.village,
            distance: Math.round(
              getDistanceInMeters(problemDoc.lat, problemDoc.lng, p.lat, p.lng),
            ),
          }))
          .filter((p) => p.distance <= 1000)
          .sort((a, b) => a.distance - b.distance)
      : [];

    return {
      ...problemDoc,
      isChild,
      isParent,
      isMain,
      docType,
      duplicateCount,
      nearbyProblems,
      hasNearby: nearbyProblems.length > 0,
      createdAt: moment(problemDoc.createdAt).tz('Asia/Vientiane').format(),
      updatedAt: moment(problemDoc.updatedAt).tz('Asia/Vientiane').format(),
    };
  };

  if (page !== undefined && limit !== undefined) {
    const skip = (page - 1) * limit;
    const take = limit;

    const [data, total] = await Promise.all([
      prisma.problemDoc.findMany({
        where,
        orderBy: {
          id: 'desc',
        },
        include,
        skip,
        take,
      }),
      prisma.problemDoc.count({ where }),
    ]);

    const activeProblems = await fetchActiveProblemsForCandidates(data);
    const totalPages = Math.ceil(total / limit);
    const mappedData = data.map((problemDoc) =>
      mapProblemWithMeta(problemDoc, activeProblems),
    );

    return {
      data: mappedData,
      total,
      page,
      limit,
      totalPages,
    };
  }

  const problems = await prisma.problemDoc.findMany({
    where,
    orderBy: {
      id: 'desc',
    },
    include,
  });

  const activeProblems = await fetchActiveProblemsForCandidates(problems);

  return problems.map((problem) => mapProblemWithMeta(problem, activeProblems));
}
