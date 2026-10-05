import { PrismaService } from '../../../prisma/prisma.service';

export async function selectTypeUnit(prisma: PrismaService) {
  return prisma.typeUnit.findMany({
    where: {
      actived: true,
    },
    orderBy: {
      id: 'asc',
    },
    select: {
      id: true,
      name: true,
    },
  });
}
