import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
  namespace: 'turnoffdoc',
})
export class TurnoffdocGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    console.log(`[TurnoffdocGateway] Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`[TurnoffdocGateway] Client disconnected: ${client.id}`);
  }

  // Broadcast refresh event to all connected clients in turnoffdoc namespace
  emitRefresh() {
    this.server.emit('turnoffdocUpdated', { action: 'refresh' });
    console.log('[TurnoffdocGateway] Emitted turnoffdocUpdated event');
  }
}
