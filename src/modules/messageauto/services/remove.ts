import { PrismaService } from '../../../prisma/prisma.service';
import { HttpStatus, NotFoundException } from '@nestjs/common';

export async function removeMessageAuto(prisma: PrismaService, id: number) {
  const messageauto = await prisma.messageAuto.findUnique({
    where: { id },
  });
  if (!messageauto) throw new NotFoundException('messageauto not found');

  await prisma.messageAuto.delete({ where: { id } });
  return {
    statusCode: HttpStatus.OK,
    message: 'messageauto deleted successfully',
  };
}
