import { PrismaService } from '../../../prisma/prisma.service';

export async function findAllVillage(prisma: PrismaService) {
  return prisma.village.findMany({
    orderBy: {
      districtCode: 'asc',
    },
    include: {
      district: true,
    },
  });
}
