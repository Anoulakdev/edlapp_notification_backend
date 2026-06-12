import { PrismaService } from '../../../prisma/prisma.service';

export async function selectDistrict(
  prisma: PrismaService,
  provinceCode?: string,
) {
  const where = provinceCode ? { provinceCode } : undefined;

  return prisma.district.findMany({
    where: where,
    orderBy: {
      id: 'asc',
    },
    select: {
      id: true,
      district_name: true,
      district_code: true,
      provinceCode: true,
    },
  });
}
