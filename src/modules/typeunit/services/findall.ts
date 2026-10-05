import { PrismaService } from '../../../prisma/prisma.service';

export async function findAllTypeUnit(prisma: PrismaService) {
  return prisma.typeUnit.findMany({
    orderBy: {
      id: 'asc',
    },
  });
}
