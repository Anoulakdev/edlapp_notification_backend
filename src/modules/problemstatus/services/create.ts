import { PrismaService } from '../../../prisma/prisma.service';
import { CreateProblemstatusDto } from '../dto/create-problemstatus.dto';

export async function createProblemStatus(
  prisma: PrismaService,
  createProblemstatusDto: CreateProblemstatusDto,
) {
  return prisma.problemStatus.create({
    data: createProblemstatusDto,
  });
}
