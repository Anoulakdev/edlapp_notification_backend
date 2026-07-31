import { PrismaService } from '../../../prisma/prisma.service';
import { HttpStatus, NotFoundException } from '@nestjs/common';

export async function clearChat(
  prisma: PrismaService,
  conversationId: number,
  userRole?: number,
) {
  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
  });

  if (!conversation || conversation.deletedAt) {
    throw new NotFoundException('Conversation not found');
  }

  const now = new Date();
  const isEdlApp = userRole === 7;

  // Clear chat only for the specific side without deleting database messages
  const updatedConversation = await prisma.conversation.update({
    where: { id: conversationId },
    data: isEdlApp
      ? {
          clearedExternalAt: now,
          unreadExternalCount: 0,
        }
      : {
          clearedAgentAt: now,
          unreadAgentCount: 0,
          lastMessage: null,
          lastMessageAt: null,
        },
  });

  return {
    statusCode: HttpStatus.OK,
    message: 'Chat cleared successfully',
    conversation: updatedConversation,
  };
}
