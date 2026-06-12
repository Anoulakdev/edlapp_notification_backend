import { PrismaService } from '../../../prisma/prisma.service';

export async function selectProvince(prisma: PrismaService) {
  return prisma.province.findMany({
    orderBy: {
      id: 'asc',
    },
    select: {
      id: true,
      province_name: true,
      province_code: true,
    },
  });
}
