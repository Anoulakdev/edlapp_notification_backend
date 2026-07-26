import { PrismaService } from '../../../prisma/prisma.service';

export async function selectBranch(prisma: PrismaService) {
  const branches = await prisma.branch.findMany({
    orderBy: {
      id: 'asc',
    },
    select: {
      id: true,
      name: true,
      code: true,
    },
  });

  return branches;
}
