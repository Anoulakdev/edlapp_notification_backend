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
  namespace: 'registermeter',
})
export class RegistermeterGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    console.log(`[RegistermeterGateway] Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`[RegistermeterGateway] Client disconnected: ${client.id}`);
  }

  // Broadcast refresh event to all connected clients in registermeter namespace
  emitRefresh() {
    this.server.emit('registermeterUpdated', { action: 'refresh' });
    console.log('[RegistermeterGateway] Emitted registermeterUpdated event');
  }
}
