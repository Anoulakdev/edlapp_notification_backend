import { Injectable } from '@nestjs/common';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { UpdateConversationDto } from './dto/update-conversation.dto';
import { PrismaService } from '../../prisma/prisma.service';
import { AuthUser } from '../../interfaces/auth-user.interface';
import { edlAppCreate } from './services/edlappCreate';
import { edlAppGet } from './services/edlappGet';
import { callCreate } from './services/callCreate';
import { callGet } from './services/callGet';
import { updateMessage } from './services/updateMessage';
import { removeMessage } from './services/removeMessage';
import { listByTopic } from './services/listByTopic';
import { ConversationGateway } from './conversation.gateway';
import moment from 'moment-timezone';

@Injectable()
export class ConversationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly conversationGateway: ConversationGateway,
  ) {}

  async edlAppCreate(createConversationDto: CreateConversationDto) {
    const conversation = await edlAppCreate(this.prisma, createConversationDto);
    await this.broadcastNewMessage(conversation.id);
    return conversation;
  }

  async callCreate(user: AuthUser, createConversationDto: CreateConversationDto) {
    const conversation = await callCreate(this.prisma, user, createConversationDto);
    await this.broadcastNewMessage(conversation.id);
    return conversation;
  }

  edlAppGet(
    externalUserId: number,
    topicId: number,
    page?: number,
    limit?: number,
  ) {
    return edlAppGet(this.prisma, Number(externalUserId), Number(topicId), {
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
    });
  }

  async callGet(
    externalUserId: number,
    topicId: number,
    page?: number,
    limit?: number,
  ) {
    const messages = await callGet(this.prisma, Number(externalUserId), Number(topicId), {
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
    });

    try {
      const conversations = await this.prisma.conversation.findMany({
        where: { topicId: Number(topicId) },
        select: { unreadAgentCount: true },
      });
      const unreadCount = conversations.reduce((sum, c) => sum + (c.unreadAgentCount || 0), 0);
      this.conversationGateway.emitTopicUnreadCountUpdate(Number(topicId), unreadCount);
    } catch (e) {
      console.error('Failed to emit topic unread count inside callGet:', e);
    }

    return messages;
  }

  listByTopic(topicId: number) {
    return listByTopic(this.prisma, topicId);
  }

  updateMessage(id: number, updateConversationDto: UpdateConversationDto) {
    return updateMessage(this.prisma, id, updateConversationDto);
  }

  remove(id: number) {
    return removeMessage(this.prisma, id);
  }

  private async broadcastNewMessage(conversationId: number) {
    try {
      const latestMessage = await this.prisma.message.findFirst({
        where: { conversationId },
        orderBy: { createdAt: 'desc' },
        include: {
          conversation: {
            select: { topicId: true },
          },
          edlappUser: {
            select: { id: true, name: true },
          },
          agentUser: {
            select: {
              id: true,
              employee: {
                select: { first_name: true, last_name: true },
              },
            },
          },
        },
      });

      if (latestMessage) {
        const formattedMessage = {
          ...latestMessage,
          createdAt: moment(latestMessage.createdAt)
            .tz('Asia/Vientiane')
            .format(),
          updatedAt: moment(latestMessage.updatedAt)
            .tz('Asia/Vientiane')
            .format(),
        };
        const topicId = latestMessage.conversation.topicId;

        // Remove conversation field from payload
        const { conversation, ...messagePayload } = formattedMessage;

        this.conversationGateway.emitNewMessage(
          conversationId,
          topicId,
          messagePayload,
        );

        // Fetch and broadcast updated topic unread count
        try {
          const conversations = await this.prisma.conversation.findMany({
            where: { topicId },
            select: { unreadAgentCount: true },
          });
          const unreadCount = conversations.reduce((sum, c) => sum + (c.unreadAgentCount || 0), 0);
          this.conversationGateway.emitTopicUnreadCountUpdate(topicId, unreadCount);
        } catch (e) {
          console.error('Failed to emit topic unread count inside broadcastNewMessage:', e);
        }
      }
    } catch (error) {
      console.error('Failed to broadcast new message via websocket:', error);
    }
  }
}
