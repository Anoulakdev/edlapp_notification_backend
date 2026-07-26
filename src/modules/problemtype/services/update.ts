import { PrismaService } from '../../../prisma/prisma.service';
import { UpdateProblemtypeDto } from '../dto/update-problemtype.dto';
import { NotFoundException } from '@nestjs/common';
import { AuthUser } from '../../../interfaces/auth-user.interface';

export async function updateProblemType(
  prisma: PrismaService,
  user: AuthUser,
  id: number,
  updateProblemtypeDto: UpdateProblemtypeDto,
) {
  const problemType = await prisma.problemType.findUnique({ where: { id } });
  if (!problemType) throw new NotFoundException('problem type not found');

  return prisma.problemType.update({
    where: { id },
    data: { ...updateProblemtypeDto, createdById: user.id },
  });
}
