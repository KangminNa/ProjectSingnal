import { Injectable, Inject } from '@nestjs/common';
import { ConsumerType } from '@common/types/consumer.types';
import { DeliveryInput, DeliveryResult } from '@common/types/delivery.types';
import { DeliveryAdapter } from '@domain/ports/outbound/delivery-adapter.port';
import { REALTIME_GATEWAY } from '@common/constants/injection-tokens';
import { RealtimeGateway } from '@domain/ports/outbound/realtime-gateway.port';
import { buildRoomName } from '@common/utils/room-name.builder';

@Injectable()
export class RealtimeDeliveryStrategy implements DeliveryAdapter {
  constructor(@Inject(REALTIME_GATEWAY) private readonly gateway: RealtimeGateway) {}

  canHandle(type: ConsumerType): boolean {
    return type === ConsumerType.WEBSOCKET;
  }

  async deliver(input: DeliveryInput): Promise<DeliveryResult> {
    const room = buildRoomName(input.projectId, 'user', input.consumerId);
    try {
      await this.gateway.publishToUser(input.projectId, input.consumerId, {
        eventType: input.channel,
        payload: input.payload,
      });
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
}
