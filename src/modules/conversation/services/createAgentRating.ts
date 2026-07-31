import { PrismaService } from '../../../prisma/prisma.service';
import { CreateAgentRatingDto } from '../dto/create-agent-rating.dto';
import { NotFoundException, BadRequestException } from '@nestjs/common';

export async function createAgentRating(
  prisma: PrismaService,
  dto: CreateAgentRatingDto,
) {
  const conversation = await prisma.conversation.findUnique({
    where: { id: dto.conversationId },
  });

  if (!conversation) {
    throw new NotFoundException('Conversation not found');
  }

  let targetAgentId = dto.agentId;
  let targetMessageId = dto.messageId;

  // 1. If messageId is provided directly, fetch target message
  if (targetMessageId) {
    const msg = await prisma.message.findUnique({
      where: { id: targetMessageId },
    });
    if (msg) {
      if (msg.agentId) targetAgentId = msg.agentId;
    } else {
      targetMessageId = undefined;
    }
  }

  // 2. If no messageId provided or not found, locate the latest rating request message
  if (!targetMessageId) {
    const lastRatingMessage = await prisma.message.findFirst({
      where: {
        conversationId: conversation.id,
        senderType: 'callcenter',
        content: { contains: 'ດາວ' },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (lastRatingMessage) {
      targetMessageId = lastRatingMessage.id;
      if (!targetAgentId && lastRatingMessage.agentId) {
        targetAgentId = lastRatingMessage.agentId;
      }
    }
  }

  // 3. Fallback for agentId if still missing
  if (!targetAgentId) {
    const lastAgentMessage = await prisma.message.findFirst({
      where: {
        conversationId: conversation.id,
        senderType: 'callcenter',
        agentId: { not: null },
      },
      orderBy: { createdAt: 'desc' },
    });
    targetAgentId = lastAgentMessage?.agentId ?? undefined;
  }

  if (!targetAgentId) {
    throw new BadRequestException(
      'No Call Center agent found associated with this conversation',
    );
  }

  // 4. Create or update AgentRating for this messageId / conversation
  let existingRating = targetMessageId
    ? await prisma.agentRating.findUnique({
        where: { messageId: targetMessageId },
      })
    : null;

  if (existingRating) {
    const updated = await prisma.agentRating.update({
      where: { id: existingRating.id },
      data: {
        rating: dto.rating,
        comment: dto.comment || null,
        agentId: targetAgentId,
      },
      include: {
        agent: {
          select: {
            id: true,
            username: true,
            employee: {
              select: { first_name: true, last_name: true },
            },
          },
        },
        externalUser: true,
      },
    });
    return updated;
  }

  const newRating = await prisma.agentRating.create({
    data: {
      agentId: targetAgentId,
      externalUserId: conversation.externalUserId,
      topicId: conversation.topicId,
      conversationId: conversation.id,
      messageId: targetMessageId ?? null,
      rating: dto.rating,
      comment: dto.comment || null,
    },
    include: {
      agent: {
        select: {
          id: true,
          username: true,
          employee: {
            select: { first_name: true, last_name: true },
          },
        },
      },
      externalUser: true,
    },
  });

  return newRating;
}

export async function getAgentRatingByConversation(
  prisma: PrismaService,
  conversationId: number,
) {
  const ratings = await prisma.agentRating.findMany({
    where: { conversationId },
    orderBy: { createdAt: 'desc' },
    include: {
      agent: {
        select: {
          id: true,
          username: true,
          employee: { select: { first_name: true, last_name: true } },
        },
      },
      externalUser: true,
    },
  });
  return ratings;
}
