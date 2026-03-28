import { Injectable, Logger } from '@nestjs/common';
import { ConsumerType } from '@common/types/consumer.types';
import { DeliveryInput, DeliveryResult } from '@common/types/delivery.types';
import { DeliveryAdapter } from '@domain/ports/outbound/delivery-adapter.port';

@Injectable()
export class EmailDeliveryStrategy implements DeliveryAdapter {
  private readonly logger = new Logger(EmailDeliveryStrategy.name);

  canHandle(type: ConsumerType): boolean {
    return type === ConsumerType.EMAIL;
  }

  async deliver(input: DeliveryInput): Promise<DeliveryResult> {
    // TODO: Integrate with email provider (SES, SendGrid) via configuration
    this.logger.warn(`Email delivery not yet implemented for consumer ${input.consumerId}`);
    return {
      success: false,
      channel: 'email',
      error: 'Email delivery not yet implemented',
      retryable: false,
      details: { type: 'email', provider: 'none' },
    };
  }
}
