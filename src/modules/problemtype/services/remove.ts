import { PrismaService } from '../../../prisma/prisma.service';
import { HttpStatus, NotFoundException } from '@nestjs/common';
import { MemoryCache } from '../../../utils/cache.util';

export async function removeProblemType(prisma: PrismaService, id: number) {
  const problemType = await prisma.problemType.findUnique({ where: { id } });
  if (!problemType) throw new NotFoundException('problem type not found');

  await prisma.problemType.delete({ where: { id } });
  MemoryCache.deleteByPrefix('select:problem_types');
  return {
    statusCode: HttpStatus.OK,
    message: 'problem type deleted successfully',
  };
}
