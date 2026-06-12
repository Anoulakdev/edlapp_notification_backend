import { PrismaService } from '../../../prisma/prisma.service';

export async function selectVillage(
  prisma: PrismaService,
  districtCode?: string,
) {
  const where = districtCode ? { districtCode } : undefined;

  return prisma.village.findMany({
    where: where,
    orderBy: {
      id: 'asc',
    },
    select: {
      id: true,
      village_name: true,
      districtCode: true,
    },
  });
}
