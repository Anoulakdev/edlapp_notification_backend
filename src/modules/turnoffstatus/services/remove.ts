import { PrismaService } from '../../../prisma/prisma.service';
import { HttpStatus, NotFoundException } from '@nestjs/common';
import { MemoryCache } from '../../../utils/cache.util';

export async function removeTurnoffStatus(prisma: PrismaService, id: number) {
  const turnoffStatus = await prisma.turnoffStatus.findUnique({
    where: { id },
  });
  if (!turnoffStatus) throw new NotFoundException('turnoffstatus not found');

  await prisma.turnoffStatus.delete({ where: { id } });
  MemoryCache.delete('select:turnoff_statuses');
  return {
    statusCode: HttpStatus.OK,
    message: 'turnoffstatus deleted successfully',
  };
}
