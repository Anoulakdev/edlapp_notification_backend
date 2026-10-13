import { PrismaService } from '../../../prisma/prisma.service';
import { CreateSourcetypeDto } from '../dto/create-sourcetype.dto';
import { MemoryCache } from '../../../utils/cache.util';

export async function createSourceType(
  prisma: PrismaService,
  createSourcetypeDto: CreateSourcetypeDto,
) {
  const result = await prisma.sourceType.create({
    data: createSourcetypeDto,
  });
  MemoryCache.delete('select:sources');
  return result;
}
