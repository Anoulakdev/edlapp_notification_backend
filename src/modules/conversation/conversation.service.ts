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
import { clearChat } from './services/clearChat';
import { listByTopic } from './services/listByTopic';
import { ConversationGateway } from './conversation.gateway';
import moment from 'moment-timezone';

import { RequestRatingDto } from './dto/request-rating.dto';
import { CreateAgentRatingDto } from './dto/create-agent-rating.dto';
import { requestRating } from './services/requestRating';
import {
  createAgentRating,
  getAgentRatingByConversation,
} from './services/createAgentRating';

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

  async callCreate(
    user: AuthUser,
    createConversationDto: CreateConversationDto,
  ) {
    const conversation = await callCreate(
      this.prisma,
      user,
      createConversationDto,
    );
    await this.broadcastNewMessage(conversation.id);
    return conversation;
  }

  async edlAppGet(
    externalUserId: number,
    topicId: number,
    page?: number,
    limit?: number,
  ) {
    const messages = await edlAppGet(
      this.prisma,
      Number(externalUserId),
      Number(topicId),
      {
        page: page ? Number(page) : undefined,
        limit: limit ? Number(limit) : undefined,
      },
    );

    try {
      const conversation = await this.prisma.conversation.findUnique({
        where: {
          externalUserId_topicId: {
            externalUserId: Number(externalUserId),
            topicId: Number(topicId),
          },
        },
      });
      if (conversation) {
        this.conversationGateway.emitMessagesSeen(
          conversation.id,
          conversation.topicId,
          'edlapp',
        );
      }
    } catch (e) {
      console.error('Failed to emit messagesSeen inside edlAppGet:', e);
    }

    return messages;
  }

  async callGet(
    externalUserId: number,
    topicId: number,
    page?: number,
    limit?: number,
  ) {
    const messages = await callGet(
      this.prisma,
      Number(externalUserId),
      Number(topicId),
      {
        page: page ? Number(page) : undefined,
        limit: limit ? Number(limit) : undefined,
      },
    );

    try {
      const conversation = await this.prisma.conversation.findUnique({
        where: {
          externalUserId_topicId: {
            externalUserId: Number(externalUserId),
            topicId: Number(topicId),
          },
        },
      });
      if (conversation) {
        this.conversationGateway.emitMessagesSeen(
          conversation.id,
          conversation.topicId,
          'callcenter',
        );
      }

      const conversations = await this.prisma.conversation.findMany({
        where: { topicId: Number(topicId), deletedAt: null },
        select: { unreadAgentCount: true },
      });
      const unreadCount = conversations.reduce(
        (sum, c) => sum + (c.unreadAgentCount || 0),
        0,
      );
      this.conversationGateway.emitTopicUnreadCountUpdate(
        Number(topicId),
        unreadCount,
      );
    } catch (e) {
      console.error(
        'Failed to emit messagesSeen or topic unread count inside callGet:',
        e,
      );
    }

    return messages;
  }

  listByTopic(topicId: number) {
    return listByTopic(this.prisma, topicId);
  }

  async updateMessage(
    id: number,
    updateConversationDto: UpdateConversationDto,
  ) {
    const updated = await updateMessage(this.prisma, id, updateConversationDto);
    await this.broadcastUpdateMessage(updated.id);
    return updated;
  }

  async remove(id: number) {
    const result = await removeMessage(this.prisma, id);
    try {
      this.conversationGateway.emitDeleteMessage(
        result.deletedMessage.conversationId,
        result.deletedMessage.topicId,
        result.deletedMessage.id,
      );
    } catch (e) {
      console.error('Failed to emit deleteMessage via websocket:', e);
    }
    return {
      statusCode: result.statusCode,
      message: result.message,
    };
  }

  async clearChat(conversationId: number, userRole?: number) {
    return clearChat(this.prisma, conversationId, userRole);
  }

  async requestRating(user: AuthUser, dto: RequestRatingDto) {
    const result = await requestRating(this.prisma, user, dto);
    try {
      this.conversationGateway.emitRequestRating(
        result.conversation.id,
        result.conversation.topicId,
        {
          message: result.message,
          agent: result.agent,
        },
      );
      await this.broadcastNewMessage(result.conversation.id);
    } catch (e) {
      console.error('Failed to emit rating request via websocket:', e);
    }
    return {
      statusCode: 200,
      message: 'Sent rating request successfully',
      data: result,
    };
  }

  async createAgentRating(dto: CreateAgentRatingDto) {
    const rating = await createAgentRating(this.prisma, dto);
    try {
      this.conversationGateway.emitAgentRatingSubmitted(
        dto.conversationId,
        rating.topicId || 0,
        rating,
      );
    } catch (e) {
      console.error('Failed to emit agent rating via websocket:', e);
    }
    return rating;
  }

  async getAgentRatingByConversation(conversationId: number) {
    return getAgentRatingByConversation(this.prisma, conversationId);
  }

  private async broadcastUpdateMessage(messageId: number) {
    try {
      const message = await this.prisma.message.findUnique({
        where: { id: messageId },
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

      if (message) {
        const formattedMessage = {
          ...message,
          createdAt: moment(message.createdAt).tz('Asia/Vientiane').format(),
          updatedAt: moment(message.updatedAt).tz('Asia/Vientiane').format(),
        };
        const topicId = message.conversation.topicId;

        // Remove conversation field from payload
        const { conversation, ...messagePayload } = formattedMessage;

        this.conversationGateway.emitUpdateMessage(
          message.conversationId,
          topicId,
          messagePayload,
        );
      }
    } catch (error) {
      console.error(
        'Failed to broadcast updated message via websocket:',
        error,
      );
    }
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
            where: { topicId, deletedAt: null },
            select: { unreadAgentCount: true },
          });
          const unreadCount = conversations.reduce(
            (sum, c) => sum + (c.unreadAgentCount || 0),
            0,
          );
          this.conversationGateway.emitTopicUnreadCountUpdate(
            topicId,
            unreadCount,
          );
        } catch (e) {
          console.error(
            'Failed to emit topic unread count inside broadcastNewMessage:',
            e,
          );
        }
      }
    } catch (error) {
      console.error('Failed to broadcast new message via websocket:', error);
    }
  }
}
