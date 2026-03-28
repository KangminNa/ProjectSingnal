import { Injectable, Logger } from '@nestjs/common';
import { ConsumerType } from '@common/types/consumer.types';
import { DeliveryInput, DeliveryResult } from '@common/types/delivery.types';
import { DeliveryAdapter } from '@domain/ports/outbound/delivery-adapter.port';

@Injectable()
export class PushDeliveryStrategy implements DeliveryAdapter {
  private readonly logger = new Logger(PushDeliveryStrategy.name);

  canHandle(type: ConsumerType): boolean {
    return type === ConsumerType.PUSH;
  }

  async deliver(input: DeliveryInput): Promise<DeliveryResult> {
    // TODO: Integrate with FCM/APNs provider via configuration
    this.logger.warn(`Push delivery not yet implemented for consumer ${input.consumerId}`);
    return {
      success: false,
      channel: 'push',
      error: 'Push delivery not yet implemented',
      retryable: false,
      details: { type: 'push', provider: 'none' },
    };
  }
}
