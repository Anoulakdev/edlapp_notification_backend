import { PrismaService } from '../../../prisma/prisma.service';
import { HttpStatus, NotFoundException } from '@nestjs/common';

export async function removeTopic(prisma: PrismaService, id: number) {
  const topic = await prisma.topic.findUnique({ where: { id } });
  if (!topic) throw new NotFoundException('topic not found');

  await prisma.topic.delete({ where: { id } });
  return {
    statusCode: HttpStatus.OK,
    message: 'topic deleted successfully',
  };
}
