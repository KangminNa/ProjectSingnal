import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Logger, Inject } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Server, Socket } from 'socket.io';
import { SocketIoTransportAdapter } from './socketio-transport.adapter';
import { SessionService } from './session.service';
import { PRESENCE_STORE } from '@core/injection-tokens';
import { PresenceStore } from '@core/event-bus';
import { buildRoomName, RoomType } from '@common/utils/room-name.builder';

@WebSocketGateway({
  cors: { origin: '*' },
  namespace: '/events',
})
export class SocketIoGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  private readonly logger = new Logger(SocketIoGateway.name);

  constructor(
    private readonly socketIoTransport: SocketIoTransportAdapter,
    @Inject(PRESENCE_STORE) private readonly presenceStore: PresenceStore,
    private readonly sessionService: SessionService,
    private readonly jwtService: JwtService,
  ) {}

  afterInit(server: Server) {
    this.socketIoTransport.setServer(server);
    this.logger.log('WebSocket gateway initialized');
  }

  handleConnection(client: Socket) {
    this.logger.debug(`Client connected: ${client.id}`);
  }

  async handleDisconnect(client: Socket) {
    const session = this.sessionService.unregister(client.id);
    if (session) {
      await this.presenceStore.setOffline(session.projectId, session.consumerId, client.id);
    }
    this.logger.debug(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('session.authenticate')
  async handleAuthenticate(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { token: string; projectId: string; consumerId: string },
  ) {
    try {
      this.jwtService.verify(data.token);
    } catch {
      return { error: 'Invalid or expired token' };
    }

    this.sessionService.register(client.id, data.projectId, data.consumerId);
    await this.presenceStore.setOnline(data.projectId, data.consumerId, client.id);

    const room = buildRoomName(data.projectId, 'user', data.consumerId);
    client.join(room);
    return { status: 'authenticated' };
  }

  @SubscribeMessage('subscription.attach')
  handleAttach(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { type: RoomType; target: string },
  ) {
    const session = this.sessionService.getSession(client.id);
    if (!session) return { error: 'Not authenticated' };

    const room = buildRoomName(session.projectId, data.type, data.target);
    client.join(room);
    return { status: 'attached', room };
  }

  @SubscribeMessage('subscription.detach')
  handleDetach(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { type: RoomType; target: string },
  ) {
    const session = this.sessionService.getSession(client.id);
    if (!session) return { error: 'Not authenticated' };

    const room = buildRoomName(session.projectId, data.type, data.target);
    client.leave(room);
    return { status: 'detached', room };
  }

  @SubscribeMessage('event.ack')
  handleAck(
    @ConnectedSocket() _client: Socket,
    @MessageBody() data: { eventId: string },
  ) {
    return { status: 'acked', eventId: data.eventId };
  }
}
