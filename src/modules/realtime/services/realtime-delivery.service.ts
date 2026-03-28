import { Injectable, Logger } from '@nestjs/common';
import { Server } from 'socket.io';
import { RealtimeGateway, RealtimeEvent } from '@domain/ports/outbound/realtime-gateway.port';

@Injectable()
export class RealtimeDeliveryService implements RealtimeGateway {
  private readonly logger = new Logger(RealtimeDeliveryService.name);
  private server: Server | null = null;

  setServer(server: Server) {
    this.server = server;
  }

  async publishToUser(projectId: string, userId: string, event: RealtimeEvent): Promise<void> {
    const room = `${projectId}:user:${userId}`;
    this.server?.to(room).emit('event.delivery', event);
    this.logger.debug(`Emitted to ${room}`);
  }

  async publishToTopic(projectId: string, topic: string, event: RealtimeEvent): Promise<void> {
    const room = `${projectId}:topic:${topic}`;
    this.server?.to(room).emit('event.delivery', event);
    this.logger.debug(`Emitted to ${room}`);
  }

  async publishToChannel(
    projectId: string,
    channelId: string,
    event: RealtimeEvent,
  ): Promise<void> {
    const room = `${projectId}:channel:${channelId}`;
    this.server?.to(room).emit('event.delivery', event);
    this.logger.debug(`Emitted to ${room}`);
  }
}
