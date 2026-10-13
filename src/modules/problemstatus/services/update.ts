import { PrismaService } from '../../../prisma/prisma.service';
import { UpdateProblemstatusDto } from '../dto/update-problemstatus.dto';
import { NotFoundException } from '@nestjs/common';
import { MemoryCache } from '../../../utils/cache.util';

export async function updateProblemStatus(
  prisma: PrismaService,
  id: number,
  updateProblemstatusDto: UpdateProblemstatusDto,
) {
  const problemStatus = await prisma.problemStatus.findUnique({
    where: { id },
  });
  if (!problemStatus) throw new NotFoundException('problemStatus not found');

  const result = await prisma.problemStatus.update({
    where: { id },
    data: updateProblemstatusDto,
  });
  MemoryCache.delete('findall:problem_statuses');
  return result;
}
