import { Injectable, Logger } from '@nestjs/common';
import { Server } from 'socket.io';
import { TransportAdapter } from '@domain/ports/outbound/transport.adapter.port';
import { ConsumerType } from '@domain/types/consumer.types';
import { DeliveryInput, DeliveryResult } from '@domain/types/delivery.types';
import { buildRoomName } from '@common/utils/room-name.builder';

@Injectable()
export class SocketIoTransportAdapter implements TransportAdapter {
  readonly type = ConsumerType.WEBSOCKET;

  private readonly logger = new Logger(SocketIoTransportAdapter.name);
  private server: Server | null = null;

  setServer(server: Server): void {
    this.server = server;
  }

  async send(input: DeliveryInput): Promise<DeliveryResult> {
    const room = buildRoomName(input.projectId, 'user', input.consumerId);

    try {
      if (!this.server) {
        return {
          success: false,
          channel: 'realtime',
          error: 'WebSocket server not initialized',
          retryable: true,
        };
      }

      this.server.to(room).emit('event.delivered', {
        eventType: input.channel,
        payload: input.payload,
      });

      this.logger.debug(`Emitted to ${room}`);

      return {
        success: true,
        channel: 'realtime',
        deliveredAt: new Date(),
        details: { type: 'realtime', room },
      };
    } catch (error) {
      return {
        success: false,
        channel: 'realtime',
        error: error instanceof Error ? error.message : 'Unknown error',
        retryable: false,
      };
    }
  }

  async publishToUser(projectId: string, userId: string, event: { eventType: string; payload: Record<string, unknown> }): Promise<void> {
    const room = buildRoomName(projectId, 'user', userId);
    this.server?.to(room).emit('event.delivered', event);
    this.logger.debug(`Emitted to ${room}`);
  }

  async publishToTopic(projectId: string, topic: string, event: { eventType: string; payload: Record<string, unknown> }): Promise<void> {
    const room = buildRoomName(projectId, 'topic', topic);
    this.server?.to(room).emit('event.delivered', event);
    this.logger.debug(`Emitted to ${room}`);
  }

  async publishToChannel(projectId: string, channelId: string, event: { eventType: string; payload: Record<string, unknown> }): Promise<void> {
    const room = buildRoomName(projectId, 'channel', channelId);
    this.server?.to(room).emit('event.delivered', event);
    this.logger.debug(`Emitted to ${room}`);
  }
}
