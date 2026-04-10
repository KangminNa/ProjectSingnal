import { Injectable, Logger } from '@nestjs/common';
import { Server } from 'socket.io';
import { TransportAdapter } from '@core/transport';
import { TransportProtocol } from '@core/enums';
import type { TransportRequest, TransportResponse } from '@core/transport';
import { buildRoomName } from '@common/utils/room-name.builder';

/**
 * SocketIoTransportAdapter
 *
 * WebSocket(Socket.IO)으로 이벤트를 실시간 전달하는 어댑터.
 * Gateway에서 setServer()를 호출해 Server 인스턴스를 주입받습니다.
 */
@Injectable()
export class SocketIoTransportAdapter implements TransportAdapter {
  readonly protocol = TransportProtocol.WEBSOCKET;

  private readonly logger = new Logger(SocketIoTransportAdapter.name);
  private server: Server | null = null;

  setServer(server: Server): void {
    this.server = server;
  }

  async send(request: TransportRequest): Promise<TransportResponse> {
    if (!this.server) {
      return this.fail('WebSocket server not initialized', true);
    }

    const room = buildRoomName(request.projectId, 'user', request.consumerId);

    try {
      this.server.to(room).emit('event.delivered', {
        eventId: request.eventId,
        payload: request.payload,
        metadata: request.metadata,
      });

      this.logger.debug(`Emitted to ${room}`);

      return {
        success: true,
        protocol: TransportProtocol.WEBSOCKET,
        deliveredAt: new Date(),
        retryable: false,
      };
    } catch (error) {
      return this.fail(
        error instanceof Error ? error.message : 'Unknown error',
        false,
      );
    }
  }

  private fail(error: string, retryable: boolean): TransportResponse {
    return { success: false, protocol: TransportProtocol.WEBSOCKET, error, retryable };
  }
}
