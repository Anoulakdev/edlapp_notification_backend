import { PrismaService } from '../../../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';

export async function findOneProblemStatus(prisma: PrismaService, id: number) {
  const problemStatus = await prisma.problemStatus.findUnique({
    where: { id },
  });
  if (!problemStatus) throw new NotFoundException('problemStatus not found');
  return problemStatus;
}
