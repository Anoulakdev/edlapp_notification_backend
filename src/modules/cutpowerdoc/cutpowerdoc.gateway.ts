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
  namespace: 'cutpowerdoc',
})
export class CutpowerdocGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    console.log(`[CutpowerdocGateway] Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`[CutpowerdocGateway] Client disconnected: ${client.id}`);
  }

  // Broadcast refresh event to all connected clients in cutpowerdoc namespace
  emitRefresh() {
    this.server.emit('cutpowerdocUpdated', { action: 'refresh' });
    console.log('[CutpowerdocGateway] Emitted cutpowerdocUpdated event');
  }
}
