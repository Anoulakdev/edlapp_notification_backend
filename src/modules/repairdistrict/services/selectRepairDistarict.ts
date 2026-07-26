import { PrismaService } from '../../../prisma/prisma.service';

export async function selectRepairDistrict(
  prisma: PrismaService,
  branchId?: number,
) {
  const repairdistricts = await prisma.repairDistrict.findMany({
    where: {
      branchId: branchId ? Number(branchId) : undefined,
    },
    orderBy: {
      id: 'asc',
    },
    select: {
      id: true,
      name: true,
      code: true,
      branch: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });
  return repairdistricts;
}
