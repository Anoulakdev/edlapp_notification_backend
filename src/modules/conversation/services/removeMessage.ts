import { PrismaService } from '../../../prisma/prisma.service';
import { HttpStatus, NotFoundException } from '@nestjs/common';

export async function removeMessage(prisma: PrismaService, id: number) {
  // 1. Check if id is Conversation ID
  const conversation = await prisma.conversation.findUnique({
    where: { id },
  });

  if (conversation) {
    const updatedConversation = await prisma.conversation.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
    });

    return {
      statusCode: HttpStatus.OK,
      message: 'conversation deleted successfully',
      deletedMessage: {
        id: updatedConversation.id,
        conversationId: updatedConversation.id,
        topicId: updatedConversation.topicId,
        deletedAt: updatedConversation.deletedAt,
      },
    };
  }

  // 2. Check if id is Message ID
  const message = await prisma.message.findUnique({
    where: { id },
    include: {
      conversation: {
        select: { topicId: true },
      },
    },
  });

  if (!message || message.deletedAt) {
    throw new NotFoundException('conversation or message not found');
  }

  // Soft delete message
  const updatedMessage = await prisma.message.update({
    where: { id },
    data: {
      deletedAt: new Date(),
    },
  });

  // 3. WhatsApp Style: Check if the deleted message is the latest message in the conversation
  const latestOverallMessage = await prisma.message.findFirst({
    where: { conversationId: message.conversationId },
    orderBy: { createdAt: 'desc' },
  });

  if (latestOverallMessage && latestOverallMessage.id === message.id) {
    await prisma.conversation.update({
      where: { id: message.conversationId },
      data: {
        lastMessage: 'ຂໍ້ຄວາມຖືກລົບແລ້ວ',
      },
    });
  }

  return {
    statusCode: HttpStatus.OK,
    message: 'message deleted successfully',
    deletedMessage: {
      id: updatedMessage.id,
      conversationId: updatedMessage.conversationId,
      topicId: message.conversation.topicId,
      deletedAt: updatedMessage.deletedAt,
    },
  };
}
