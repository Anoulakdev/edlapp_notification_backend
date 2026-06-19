import { PrismaService } from '../../../prisma/prisma.service';
import { HttpStatus, NotFoundException } from '@nestjs/common';

export async function removeProblemStatus(prisma: PrismaService, id: number) {
  const problemStatus = await prisma.problemStatus.findUnique({
    where: { id },
  });
  if (!problemStatus) throw new NotFoundException('problemStatus not found');

  await prisma.problemStatus.delete({ where: { id } });
  return {
    statusCode: HttpStatus.OK,
    message: 'problemStatus deleted successfully',
  };
}
