import { Injectable, Logger } from '@nestjs/common';
import { TransportAdapter } from '@domain/ports/outbound/transport.adapter.port';
import { ConsumerType } from '@domain/types/consumer.types';
import { DeliveryInput, DeliveryResult } from '@domain/types/delivery.types';

@Injectable()
export class PushTransportAdapter implements TransportAdapter {
  readonly type = ConsumerType.PUSH;

  private readonly logger = new Logger(PushTransportAdapter.name);

  async send(input: DeliveryInput): Promise<DeliveryResult> {
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
