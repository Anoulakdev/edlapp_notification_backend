import { PrismaService } from '../../../prisma/prisma.service';

export async function findAllProblemStatus(prisma: PrismaService) {
  return prisma.problemStatus.findMany({
    orderBy: {
      id: 'asc',
    },
  });
}
