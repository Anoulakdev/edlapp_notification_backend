import { PrismaService } from '../../../prisma/prisma.service';
import { HttpStatus, NotFoundException } from '@nestjs/common';
import { MemoryCache } from '../../../utils/cache.util';

export async function removeProblemStatus(prisma: PrismaService, id: number) {
  const problemStatus = await prisma.problemStatus.findUnique({
    where: { id },
  });
  if (!problemStatus) throw new NotFoundException('problemStatus not found');

  await prisma.problemStatus.delete({ where: { id } });
  MemoryCache.delete('findall:problem_statuses');
  return {
    statusCode: HttpStatus.OK,
    message: 'problemStatus deleted successfully',
  };
}
