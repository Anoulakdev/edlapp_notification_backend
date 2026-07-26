import { PrismaService } from '../../../prisma/prisma.service';
import { UpdateMessageautoDto } from '../dto/update-messageauto.dto';
import { NotFoundException } from '@nestjs/common';

export async function updateMessageAuto(
  prisma: PrismaService,
  id: number,
  updateMessageautoDto: UpdateMessageautoDto,
) {
  const messageauto = await prisma.messageAuto.findUnique({
    where: { id },
  });
  if (!messageauto) throw new NotFoundException('messageauto not found');

  return prisma.messageAuto.update({
    where: { id },
    data: {
      ...updateMessageautoDto,
      topicId: Number(updateMessageautoDto.topicId),
    },
  });
}
