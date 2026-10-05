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

@WebSocketGateway({
  cors: {
    origin: '*',
  },
  namespace: 'users',
})
export class UserGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  // Track active socket connections: userId -> Set of socket IDs
  private userSockets = new Map<number, Set<string>>();
  // Reverse lookup: socketId -> userId
  private socketToUser = new Map<string, number>();
  // Throttle DB updates for heartbeat: userId -> last updated timestamp (ms)
  private userLastHeartbeatDbUpdate = new Map<number, number>();
  // Debounce timer for online count broadcast
  private broadcastOnlineCountTimer: NodeJS.Timeout | null = null;

  constructor(private readonly prisma: PrismaService) {}

  async handleConnection(client: Socket) {
    const rawUserId =
      client.handshake.auth?.userId ||
      client.handshake.query?.userId;

    if (rawUserId) {
      const userId = Number(rawUserId);
      if (!isNaN(userId) && userId > 0) {
        await this.registerUserConnection(client.id, userId);
      }
    }
  }

  async handleDisconnect(client: Socket) {
    await this.unregisterUserConnection(client.id);
  }

  @SubscribeMessage('identify')
  async handleIdentify(
    @MessageBody() data: { userId: number },
    @ConnectedSocket() client: Socket,
  ) {
    if (data?.userId) {
      const userId = Number(data.userId);
      if (!isNaN(userId) && userId > 0) {
        await this.registerUserConnection(client.id, userId);
        return { success: true, userId, onlineUsers: this.getOnlineUserIds() };
      }
    }
    return { success: false };
  }

  @SubscribeMessage('getOnlineUsers')
  handleGetOnlineUsers() {
    return { onlineUserIds: this.getOnlineUserIds() };
  }

  @SubscribeMessage('heartbeat')
  async handleHeartbeat(@ConnectedSocket() client: Socket) {
    const userId = this.socketToUser.get(client.id);
    if (userId) {
      const now = new Date();
      const lastUpdate = this.userLastHeartbeatDbUpdate.get(userId) || 0;
      // Only write to DB at most once every 60 seconds per user to prevent DB lock contention
      if (now.getTime() - lastUpdate >= 60000) {
        this.userLastHeartbeatDbUpdate.set(userId, now.getTime());
        try {
          await this.prisma.user.update({
            where: { id: userId },
            data: { lastActiveAt: now },
          });
        } catch (e) {
          console.error(`[UserGateway] Heartbeat update error for user ${userId}:`, e);
        }
      }
      return { success: true, timestamp: now };
    }
    return { success: false };
  }

  private async registerUserConnection(socketId: string, userId: number) {
    let sockets = this.userSockets.get(userId);
    const isFirstConnection = !sockets || sockets.size === 0;

    if (!sockets) {
      sockets = new Set();
      this.userSockets.set(userId, sockets);
    }
    sockets.add(socketId);
    this.socketToUser.set(socketId, userId);

    const now = new Date();

    if (isFirstConnection) {
      try {
        await this.prisma.user.update({
          where: { id: userId },
          data: {
            isOnline: true,
            lastActiveAt: now,
          },
        });
      } catch (err) {
        console.error(`[UserGateway] Failed to update user ${userId} to online:`, err);
      }

      this.broadcastStatus(userId, true, now);
      console.log(`[UserGateway] User ${userId} is now ONLINE (Socket: ${socketId})`);
    } else {
      console.log(`[UserGateway] User ${userId} connected additional socket ${socketId} (Total: ${sockets.size})`);
    }

    // Send the current list of online user IDs to the connected client
    if (this.server) {
      this.server.to(socketId).emit('onlineUsersList', {
        onlineUserIds: this.getOnlineUserIds(),
      });
    }
  }

  private async unregisterUserConnection(socketId: string) {
    const userId = this.socketToUser.get(socketId);
    if (!userId) return;

    this.socketToUser.delete(socketId);
    const sockets = this.userSockets.get(userId);

    if (sockets) {
      sockets.delete(socketId);
      if (sockets.size === 0) {
        this.userSockets.delete(userId);
        this.userLastHeartbeatDbUpdate.delete(userId);
        const now = new Date();
        try {
          await this.prisma.user.update({
            where: { id: userId },
            data: {
              isOnline: false,
              lastActiveAt: now,
            },
          });
        } catch (err) {
          console.error(`[UserGateway] Failed to update user ${userId} to offline:`, err);
        }

        this.broadcastStatus(userId, false, now);
        console.log(`[UserGateway] User ${userId} is now OFFLINE (All sockets disconnected)`);
      } else {
        console.log(`[UserGateway] User ${userId} disconnected socket ${socketId} (Remaining: ${sockets.size})`);
      }
    }
  }

  broadcastStatus(userId: number, isOnline: boolean, timestamp = new Date(), lastLoginAt?: Date) {
    if (this.server) {
      this.server.emit('userStatusChanged', {
        userId,
        isOnline,
        onlineStatus: isOnline ? 'online' : 'offline',
        lastActiveAt: timestamp,
        lastLoginAt: lastLoginAt || undefined,
      });

      // Broadcast real-time online count to all connected clients (debounced to avoid DB thrashing)
      this.broadcastOnlineCountDebounced();
    }
  }

  broadcastOnlineCountDebounced(delay = 300) {
    if (this.broadcastOnlineCountTimer) {
      clearTimeout(this.broadcastOnlineCountTimer);
    }
    this.broadcastOnlineCountTimer = setTimeout(() => {
      this.broadcastOnlineCount().catch((err) => {
        console.error('[UserGateway] Error in debounced broadcastOnlineCount:', err);
      });
    }, delay);
  }

  async broadcastOnlineCount() {
    if (!this.server) return;
    try {
      const liveSocketUserIds = this.getOnlineUserIds();
      const onlineCondition: any[] = [{ isOnline: true }];
      if (liveSocketUserIds.length > 0) {
        onlineCondition.push({ id: { in: liveSocketUserIds } });
      }

      const count = await this.prisma.user.count({
        where: {
          roleId: { in: [2, 3, 4, 5, 6] },
          status: 'A',
          OR: onlineCondition,
        },
      });

      this.server.emit('userOnlineCountUpdated', { count, total: count });
      this.server.emit('userOnlineUpdated', { count, total: count });
    } catch (err) {
      console.error('[UserGateway] Failed to broadcast online count:', err);
    }
  }

  @SubscribeMessage('getUserOnlineCount')
  async handleGetUserOnlineCount() {
    const liveSocketUserIds = this.getOnlineUserIds();
    const onlineCondition: any[] = [{ isOnline: true }];
    if (liveSocketUserIds.length > 0) {
      onlineCondition.push({ id: { in: liveSocketUserIds } });
    }

    const count = await this.prisma.user.count({
      where: {
        roleId: { in: [2, 3, 4, 5, 6] },
        status: 'A',
        OR: onlineCondition,
      },
    });

    return { count, total: count };
  }

  getOnlineUserIds(): number[] {
    return Array.from(this.userSockets.keys());
  }

  isUserOnline(userId: number): boolean {
    return (this.userSockets.get(userId)?.size || 0) > 0;
  }
}
