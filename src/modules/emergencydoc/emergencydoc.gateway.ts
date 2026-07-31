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
  namespace: 'emergencydoc',
})
export class EmergencydocGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    console.log(`[EmergencydocGateway] Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`[EmergencydocGateway] Client disconnected: ${client.id}`);
  }

  // Broadcast refresh event to all connected clients in emergencydoc namespace
  emitRefresh() {
    this.server.emit('emergencydocUpdated', { action: 'refresh' });
    console.log('[EmergencydocGateway] Emitted emergencydocUpdated event');
  }
}
