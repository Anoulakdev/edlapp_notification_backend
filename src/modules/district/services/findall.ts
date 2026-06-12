import { PrismaService } from '../../../prisma/prisma.service';

export async function findAllDistrict(prisma: PrismaService) {
  return prisma.district.findMany({
    orderBy: {
      provinceCode: 'asc',
    },
    include: {
      province: true,
    },
  });
}
