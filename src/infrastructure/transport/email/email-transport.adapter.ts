import { Injectable, Logger } from '@nestjs/common';
import { TransportAdapter } from '@domain/ports/outbound/transport.adapter.port';
import { ConsumerType } from '@domain/types/consumer.types';
import { DeliveryInput, DeliveryResult } from '@domain/types/delivery.types';

@Injectable()
export class EmailTransportAdapter implements TransportAdapter {
  readonly type = ConsumerType.EMAIL;

  private readonly logger = new Logger(EmailTransportAdapter.name);

  async send(input: DeliveryInput): Promise<DeliveryResult> {
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
