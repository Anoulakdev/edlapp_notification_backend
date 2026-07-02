import { PrismaService } from '../../../prisma/prisma.service';
import { UpdateConversationDto } from '../dto/update-conversation.dto';
import { NotFoundException } from '@nestjs/common';

export async function updateMessage(
  prisma: PrismaService,
  id: number,
  updateConversationDto: UpdateConversationDto,
) {
  const message = await prisma.message.findUnique({ where: { id } });
  if (!message) throw new NotFoundException('message not found');

  return prisma.message.update({
    where: { id },
    data: updateConversationDto,
  });
}
