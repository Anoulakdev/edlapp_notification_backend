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
  namespace: 'problemdoc',
})
export class ProblemdocGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    console.log(`[ProblemdocGateway] Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`[ProblemdocGateway] Client disconnected: ${client.id}`);
  }

  // Broadcast refresh event to all connected clients in problemdoc namespace
  emitRefresh() {
    this.server.emit('problemdocUpdated', { action: 'refresh' });
    console.log('[ProblemdocGateway] Emitted problemdocUpdated event');
  }
}
