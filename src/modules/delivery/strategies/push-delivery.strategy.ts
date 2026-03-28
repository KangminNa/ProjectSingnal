import { Injectable } from '@nestjs/common';
import { ConsumerType } from '@common/types/consumer.types';
import { DeliveryInput, DeliveryResult } from '@common/types/delivery.types';
import { DeliveryAdapter } from '@domain/ports/outbound/delivery-adapter.port';

@Injectable()
export class PushDeliveryStrategy implements DeliveryAdapter {
  canHandle(type: ConsumerType): boolean {
    return type === ConsumerType.PUSH;
  }

  async deliver(input: DeliveryInput): Promise<DeliveryResult> {
    // TODO: Integrate with FCM/APNs provider
    return { success: false, channel: 'push', error: 'Push delivery not yet implemented' };
  }
}
