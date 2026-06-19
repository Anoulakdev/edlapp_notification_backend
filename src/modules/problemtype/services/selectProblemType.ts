import { PrismaService } from '../../../prisma/prisma.service';

export async function selectProblemType(prisma: PrismaService) {
  return prisma.problemType.findMany({
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
