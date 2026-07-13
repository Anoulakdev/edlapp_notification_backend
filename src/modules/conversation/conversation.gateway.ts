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

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
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
    const convRoom = `conversation_${conversationId}`;
    const topicRoom = `topic_${topicId}`;
    const payload = { ...message, topicId };
    this.server.to(convRoom).emit('newMessage', payload);
    this.server.to(topicRoom).emit('newMessage', payload);
    console.log(`Emitted newMessage to rooms ${convRoom} and ${topicRoom}`);
  }

  // Helper method to emit topic unread count updates globally
  emitTopicUnreadCountUpdate(topicId: number, unreadCount: number) {
    this.server.emit('topicUnreadCountUpdate', { topicId, unreadCount });
    console.log(`Emitted topicUnreadCountUpdate to topic_${topicId} globally: ${unreadCount}`);
  }

  // Helper method to emit message seen status
  emitMessagesSeen(conversationId: number, topicId: number, senderType: 'edlapp' | 'callcenter') {
    const convRoom = `conversation_${conversationId}`;
    const topicRoom = `topic_${topicId}`;
    const payload = { conversationId, topicId, senderType };
    this.server.to(convRoom).emit('messagesSeen', payload);
    this.server.to(topicRoom).emit('messagesSeen', payload);
    console.log(`Emitted messagesSeen to rooms ${convRoom} and ${topicRoom}: ${JSON.stringify(payload)}`);
  }
}
