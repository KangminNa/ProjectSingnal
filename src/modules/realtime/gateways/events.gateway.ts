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
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { RealtimeDeliveryService } from '../services/realtime-delivery.service';
import { PresenceService } from '../services/presence.service';
import { SessionService } from '../services/session.service';

@WebSocketGateway({
  cors: { origin: '*' },
  namespace: '/events',
})
export class EventsGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  private readonly logger = new Logger(EventsGateway.name);

  constructor(
    private readonly realtimeDelivery: RealtimeDeliveryService,
    private readonly presenceService: PresenceService,
    private readonly sessionService: SessionService,
  ) {}

  afterInit(server: Server) {
    this.realtimeDelivery.setServer(server);
    this.logger.log('WebSocket gateway initialized');
  }

  handleConnection(client: Socket) {
    this.logger.debug(`Client connected: ${client.id}`);
  }

  async handleDisconnect(client: Socket) {
    const session = this.sessionService.unregister(client.id);
    if (session) {
      await this.presenceService.markOffline(session.projectId, session.consumerId, client.id);
    }
    this.logger.debug(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('session.authenticate')
  async handleAuthenticate(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { token: string; projectId: string; consumerId: string },
  ) {
    // TODO: Validate token
    this.sessionService.register(client.id, data.projectId, data.consumerId);
    await this.presenceService.markOnline(data.projectId, data.consumerId, client.id);

    client.join(`${data.projectId}:user:${data.consumerId}`);
    return { status: 'authenticated' };
  }

  @SubscribeMessage('subscription.attach')
  handleAttach(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { type: 'topic' | 'user' | 'channel'; target: string },
  ) {
    const session = this.sessionService.getSession(client.id);
    if (!session) return { error: 'Not authenticated' };

    const room = `${session.projectId}:${data.type}:${data.target}`;
    client.join(room);
    return { status: 'attached', room };
  }

  @SubscribeMessage('subscription.detach')
  handleDetach(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { type: 'topic' | 'user' | 'channel'; target: string },
  ) {
    const session = this.sessionService.getSession(client.id);
    if (!session) return { error: 'Not authenticated' };

    const room = `${session.projectId}:${data.type}:${data.target}`;
    client.leave(room);
    return { status: 'detached', room };
  }

  @SubscribeMessage('event.ack')
  handleAck(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { eventId: string },
  ) {
    // TODO: Process event acknowledgment
    return { status: 'acked', eventId: data.eventId };
  }
}
