import { PrismaService } from '../../../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';

export async function findOneProblemType(prisma: PrismaService, id: number) {
  const problemType = await prisma.problemType.findUnique({
    where: { id },
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
      problemdocs: true,
    },
  });
  if (!problemType) throw new NotFoundException('problem type not found');
  return problemType;
}
