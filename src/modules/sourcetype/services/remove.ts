import { PrismaService } from '../../../prisma/prisma.service';
import { HttpStatus, NotFoundException } from '@nestjs/common';
import { MemoryCache } from '../../../utils/cache.util';

export async function removeSourceType(prisma: PrismaService, id: number) {
  const sourceType = await prisma.sourceType.findUnique({ where: { id } });
  if (!sourceType) throw new NotFoundException('sourceType not found');

  await prisma.sourceType.delete({ where: { id } });
  MemoryCache.delete('select:sources');
  return {
    statusCode: HttpStatus.OK,
    message: 'sourceType deleted successfully',
  };
}
