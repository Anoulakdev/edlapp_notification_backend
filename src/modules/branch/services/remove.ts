import { PrismaService } from '../../../prisma/prisma.service';
import { HttpStatus, NotFoundException } from '@nestjs/common';
import { MemoryCache } from '../../../utils/cache.util';

export async function removeBranch(prisma: PrismaService, id: number) {
  const branch = await prisma.branch.findUnique({ where: { id } });
  if (!branch) throw new NotFoundException('branch not found');

  await prisma.branch.delete({ where: { id } });
  MemoryCache.delete('select:branches');
  return {
    statusCode: HttpStatus.OK,
    message: 'branch deleted successfully',
  };
}
