import { PrismaService } from '../../../prisma/prisma.service';

export async function findAllProvince(prisma: PrismaService) {
  return prisma.province.findMany({
    orderBy: {
      id: 'asc',
    },
  });
}
