import { PrismaService } from '../../../prisma/prisma.service';
import { HttpStatus, NotFoundException } from '@nestjs/common';

export async function removeMessage(prisma: PrismaService, id: number) {
  const message = await prisma.message.findUnique({ where: { id } });
  if (!message) throw new NotFoundException('message not found');

  await prisma.message.delete({ where: { id } });
  return {
    statusCode: HttpStatus.OK,
    message: 'message deleted successfully',
  };
}
