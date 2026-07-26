import { PrismaService } from '../../../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';
import moment from 'moment-timezone';

export async function findOneMessageAuto(prisma: PrismaService, id: number) {
  const messageauto = await prisma.messageAuto.findUnique({
    where: { id },
    include: {
      topic: {
        select: {
          id: true,
          name: true,
          description: true,
        },
      },
    },
  });
  if (!messageauto) throw new NotFoundException('messageauto not found');
  return {
    ...messageauto,
    createdAt: moment(messageauto.createdAt).tz('Asia/Vientiane').format(),
    updatedAt: moment(messageauto.updatedAt).tz('Asia/Vientiane').format(),
  };
}
