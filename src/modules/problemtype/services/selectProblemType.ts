import { PrismaService } from '../../../prisma/prisma.service';

export async function selectProblemType(prisma: PrismaService) {
  return prisma.problemType.findMany({
    where: {
      actived: true,
    },
    orderBy: {
      code: 'asc',
    },
    select: {
      id: true,
      name: true,
      code: true,
    },
  });
}
