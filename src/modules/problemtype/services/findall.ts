import { PrismaService } from '../../../prisma/prisma.service';

export async function findAllProblemType(prisma: PrismaService) {
  return prisma.problemType.findMany({
    orderBy: {
      id: 'asc',
    },
    include: {
      createdBy: {
        select: {
          id: true,
          employee: {
            select: {
              id: true,
              first_name: true,
              last_name: true,
              gender: true,
              emp_code: true,
            },
          },
        },
      },
      problemdocs: {
        orderBy: {
          id: 'desc',
        },
        take: 1,
        select: {
          id: true,
        },
      },
    },
  });
}
