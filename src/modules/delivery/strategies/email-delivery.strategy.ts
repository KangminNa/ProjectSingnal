import { Injectable } from '@nestjs/common';
import { ConsumerType } from '@common/types/consumer.types';
import { DeliveryInput, DeliveryResult } from '@common/types/delivery.types';
import { DeliveryAdapter } from '@domain/ports/outbound/delivery-adapter.port';

@Injectable()
export class EmailDeliveryStrategy implements DeliveryAdapter {
  canHandle(type: ConsumerType): boolean {
    return type === ConsumerType.EMAIL;
  }

  async deliver(input: DeliveryInput): Promise<DeliveryResult> {
    // TODO: Integrate with email provider (SES, SendGrid, etc.)
    return { success: false, channel: 'email', error: 'Email delivery not yet implemented' };
  }
}
