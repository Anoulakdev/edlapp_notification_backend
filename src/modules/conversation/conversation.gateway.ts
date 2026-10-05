import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { PrismaService } from '../../prisma/prisma.service';
import { unreadCount } from './services/unreadCount';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
  namespace: 'conversation',
})
export class ConversationGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  constructor(private readonly prisma: PrismaService) {}

  async handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
    try {
      const data = await unreadCount(this.prisma);
      client.emit('totalUnreadCountUpdate', data);
      client.emit('unreadCountUpdate', data);
    } catch (e) {
      console.error('Failed to emit initial unread count on connect:', e);
    }
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('getTotalUnreadCount')
  async handleGetTotalUnreadCount(@ConnectedSocket() client: Socket) {
    try {
      const data = await unreadCount(this.prisma);
      client.emit('totalUnreadCountUpdate', data);
      client.emit('unreadCountUpdate', data);
      return data;
    } catch (e) {
      console.error('Failed to get total unread count:', e);
      return { total: 0, unreadCount: 0, unreadAgentCount: 0 };
    }
  }

  @SubscribeMessage('joinRoom')
  handleJoinRoom(
    @MessageBody()
    data: { conversationId?: number | string; topicId?: number | string },
    @ConnectedSocket() client: Socket,
  ) {
    if (data.conversationId) {
      const roomName = `conversation_${data.conversationId}`;
      client.join(roomName);
      console.log(`Client ${client.id} joined room: ${roomName}`);
    }
    if (data.topicId) {
      const roomName = `topic_${data.topicId}`;
      client.join(roomName);
      console.log(`Client ${client.id} joined room: ${roomName}`);
    }
    return { event: 'joinedRoom', data };
  }

  @SubscribeMessage('leaveRoom')
  handleLeaveRoom(
    @MessageBody()
    data: { conversationId?: number | string; topicId?: number | string },
    @ConnectedSocket() client: Socket,
  ) {
    if (data.conversationId) {
      const roomName = `conversation_${data.conversationId}`;
      client.leave(roomName);
      console.log(`Client ${client.id} left room: ${roomName}`);
    }
    if (data.topicId) {
      const roomName = `topic_${data.topicId}`;
      client.leave(roomName);
      console.log(`Client ${client.id} left room: ${roomName}`);
    }
    return { event: 'leftRoom', data };
  }

  // Helper method to emit new message to both conversation room and topic room
  emitNewMessage(conversationId: number, topicId: number, message: any) {
    if (!this.server) return;
    const convRoom = `conversation_${conversationId}`;
    const topicRoom = `topic_${topicId}`;
    const payload = { ...message, topicId };
    this.server.to(convRoom).emit('newMessage', payload);
    this.server.to(topicRoom).emit('newMessage', payload);
    console.log(`Emitted newMessage to rooms ${convRoom} and ${topicRoom}`);
  }

  // Helper method to emit topic unread count updates globally
  emitTopicUnreadCountUpdate(topicId: number, unreadCount: number) {
    if (!this.server) return;
    this.server.emit('topicUnreadCountUpdate', { topicId, unreadCount });
    console.log(
      `Emitted topicUnreadCountUpdate to topic_${topicId} globally: ${unreadCount}`,
    );
  }

  // Helper method to emit total unread count updates globally in real-time
  emitTotalUnreadCountUpdate(total: number) {
    if (!this.server) return;
    const payload = {
      total,
      unreadAgentCount: total,
      unreadCount: total,
    };
    this.server.emit('totalUnreadCountUpdate', payload);
    this.server.emit('unreadCountUpdate', payload);
    console.log(`Emitted totalUnreadCountUpdate globally: ${total}`);
  }

  // Helper method to emit message seen status
  emitMessagesSeen(
    conversationId: number,
    topicId: number,
    senderType: 'edlapp' | 'callcenter',
  ) {
    if (!this.server) return;
    const convRoom = `conversation_${conversationId}`;
    const topicRoom = `topic_${topicId}`;
    const payload = { conversationId, topicId, senderType };
    this.server.to(convRoom).emit('messagesSeen', payload);
    this.server.to(topicRoom).emit('messagesSeen', payload);
    console.log(
      `Emitted messagesSeen to rooms ${convRoom} and ${topicRoom}: ${JSON.stringify(payload)}`,
    );
  }

  // Helper method to emit updated message to both conversation room and topic room
  emitUpdateMessage(conversationId: number, topicId: number, message: any) {
    if (!this.server) return;
    const convRoom = `conversation_${conversationId}`;
    const topicRoom = `topic_${topicId}`;
    const payload = { ...message, topicId };
    this.server.to(convRoom).emit('updateMessage', payload);
    this.server.to(topicRoom).emit('updateMessage', payload);
    console.log(`Emitted updateMessage to rooms ${convRoom} and ${topicRoom}`);
  }

  // Helper method to emit deleted message to both conversation room and topic room
  emitDeleteMessage(
    conversationId: number,
    topicId: number,
    messageId: number,
  ) {
    if (!this.server) return;
    const convRoom = `conversation_${conversationId}`;
    const topicRoom = `topic_${topicId}`;
    const payload = { messageId, conversationId, topicId };
    this.server.to(convRoom).emit('deleteMessage', payload);
    this.server.to(topicRoom).emit('deleteMessage', payload);
    console.log(`Emitted deleteMessage to rooms ${convRoom} and ${topicRoom}`);
  }

  // Helper method to emit rating request to conversation room
  emitRequestRating(conversationId: number, topicId: number, data: any) {
    if (!this.server) return;
    const convRoom = `conversation_${conversationId}`;
    const topicRoom = `topic_${topicId}`;
    const payload = { ...data, conversationId, topicId };
    this.server.to(convRoom).emit('ratingRequested', payload);
    this.server.to(topicRoom).emit('ratingRequested', payload);
    console.log(`Emitted ratingRequested to rooms ${convRoom} and ${topicRoom}`);
  }

  // Helper method to emit submitted rating to conversation room & topic room
  emitAgentRatingSubmitted(
    conversationId: number,
    topicId: number,
    ratingData: any,
  ) {
    if (!this.server) return;
    const convRoom = `conversation_${conversationId}`;
    const topicRoom = `topic_${topicId}`;
    const payload = { ...ratingData, conversationId, topicId };
    this.server.to(convRoom).emit('ratingSubmitted', payload);
    this.server.to(topicRoom).emit('ratingSubmitted', payload);
    console.log(`Emitted ratingSubmitted to rooms ${convRoom} and ${topicRoom}`);
  }
}
