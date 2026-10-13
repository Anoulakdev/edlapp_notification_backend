import { PrismaService } from '../../../prisma/prisma.service';
import { UpdateSourcetypeDto } from '../dto/update-sourcetype.dto';
import { NotFoundException } from '@nestjs/common';
import { MemoryCache } from '../../../utils/cache.util';

export async function updateSourceType(
  prisma: PrismaService,
  id: number,
  updateSourcetypeDto: UpdateSourcetypeDto,
) {
  const sourceType = await prisma.sourceType.findUnique({ where: { id } });
  if (!sourceType) throw new NotFoundException('sourceType not found');

  const result = await prisma.sourceType.update({
    where: { id },
    data: updateSourcetypeDto,
  });
  MemoryCache.delete('select:sources');
  return result;
}
