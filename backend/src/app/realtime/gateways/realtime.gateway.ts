import { isAccessTokenPayload } from '@app/auth/helpers/token.helper.js';
import { SOCKET_UNAUTHORIZED_MESSAGE } from '@app/realtime/constants/realtime.constants.js';
import { buildUserRoom, readHandshakeToken } from '@app/realtime/helpers/realtime.helper.js';
import type { TRealtimeServer, TRealtimeSocket } from '@app/realtime/types/realtime.types.js';
import { JwtService } from '@nestjs/jwt';
import { type OnGatewayInit, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';

@WebSocketGateway()
export class RealtimeGateway implements OnGatewayInit<TRealtimeServer> {
  @WebSocketServer()
  private readonly server: TRealtimeServer;

  constructor(private readonly jwtService: JwtService) {}

  afterInit(server: TRealtimeServer): void {
    server.use((socket, next) => {
      void this.authenticate(socket, next);
    });
  }

  emitToUser(userId: string, event: string, payload: unknown): void {
    this.server.to(buildUserRoom(userId)).emit(event, payload);
  }

  broadcast(event: string, payload: unknown): void {
    this.server.emit(event, payload);
  }

  private async authenticate(
    socket: TRealtimeSocket,
    next: (error?: Error) => void,
  ): Promise<void> {
    const token = readHandshakeToken(socket.handshake.auth);
    const payload = token ? await this.verifyToken(token) : null;

    if (!isAccessTokenPayload(payload)) {
      next(new Error(SOCKET_UNAUTHORIZED_MESSAGE));

      return;
    }

    socket.data.userId = payload.sub;
    await socket.join(buildUserRoom(payload.sub));
    next();
  }

  private async verifyToken(token: string): Promise<unknown> {
    try {
      return await this.jwtService.verifyAsync(token);
    } catch {
      return null;
    }
  }
}
