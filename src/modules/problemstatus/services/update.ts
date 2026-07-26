import { PrismaService } from '../../../prisma/prisma.service';
import { UpdateProblemstatusDto } from '../dto/update-problemstatus.dto';
import { NotFoundException } from '@nestjs/common';

export async function updateProblemStatus(
  prisma: PrismaService,
  id: number,
  updateProblemstatusDto: UpdateProblemstatusDto,
) {
  const problemStatus = await prisma.problemStatus.findUnique({
    where: { id },
  });
  if (!problemStatus) throw new NotFoundException('problemStatus not found');

  return prisma.problemStatus.update({
    where: { id },
    data: updateProblemstatusDto,
  });
}
