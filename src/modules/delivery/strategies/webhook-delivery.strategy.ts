import { Injectable } from '@nestjs/common';
import { ConsumerType } from '@common/types/consumer.types';
import { DeliveryInput, DeliveryResult } from '@common/types/delivery.types';
import { DeliveryAdapter } from '@domain/ports/outbound/delivery-adapter.port';

@Injectable()
export class WebhookDeliveryStrategy implements DeliveryAdapter {
  canHandle(type: ConsumerType): boolean {
    return type === ConsumerType.WEBHOOK;
  }

  async deliver(input: DeliveryInput): Promise<DeliveryResult> {
    // TODO: HTTP POST to consumer endpoint with payload
    return { success: false, channel: 'webhook', error: 'Webhook delivery not yet implemented' };
  }
}
