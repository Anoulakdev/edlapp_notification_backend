import { PrismaService } from '../../../prisma/prisma.service';
import { HttpStatus, NotFoundException } from '@nestjs/common';

export async function removeProblemType(prisma: PrismaService, id: number) {
  const problemType = await prisma.problemType.findUnique({ where: { id } });
  if (!problemType) throw new NotFoundException('problem type not found');

  await prisma.problemType.delete({ where: { id } });
  return {
    statusCode: HttpStatus.OK,
    message: 'problem type deleted successfully',
  };
}
