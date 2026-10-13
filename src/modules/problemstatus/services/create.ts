import { PrismaService } from '../../../prisma/prisma.service';
import { CreateProblemstatusDto } from '../dto/create-problemstatus.dto';
import { MemoryCache } from '../../../utils/cache.util';

export async function createProblemStatus(
  prisma: PrismaService,
  createProblemstatusDto: CreateProblemstatusDto,
) {
  const result = await prisma.problemStatus.create({
    data: createProblemstatusDto,
  });
  MemoryCache.delete('findall:problem_statuses');
  return result;
}
