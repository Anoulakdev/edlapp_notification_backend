import { HttpStatus, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

export async function updateStatus(
  prisma: PrismaService,
  id: number,
  actived: string,
) {
  const topic = await prisma.topic.findUnique({ where: { id } });

  if (!topic) {
    throw new NotFoundException('Topic not found');
  }

  await prisma.topic.update({
    where: { id },
    data: { actived: actived === 'true' ? true : false },
  });

  return {
    statusCode: HttpStatus.OK,
    message: 'Update status successfully',
  };
}
