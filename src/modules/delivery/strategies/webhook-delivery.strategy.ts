import { Injectable, Logger } from '@nestjs/common';
import { ConsumerType } from '@common/types/consumer.types';
import { DeliveryInput, DeliveryResult } from '@common/types/delivery.types';
import { DeliveryAdapter } from '@domain/ports/outbound/delivery-adapter.port';

const WEBHOOK_TIMEOUT_MS = 10_000;

@Injectable()
export class WebhookDeliveryStrategy implements DeliveryAdapter {
  private readonly logger = new Logger(WebhookDeliveryStrategy.name);

  canHandle(type: ConsumerType): boolean {
    return type === ConsumerType.WEBHOOK;
  }

  async deliver(input: DeliveryInput): Promise<DeliveryResult> {
    if (!input.endpoint) {
      return {
        success: false,
        channel: 'webhook',
        error: 'No endpoint configured for webhook consumer',
        retryable: false,
      };
    }

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), WEBHOOK_TIMEOUT_MS);

      const response = await fetch(input.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Event-Id': input.eventId,
          'X-Project-Id': input.projectId,
        },
        body: JSON.stringify({
          eventId: input.eventId,
          payload: input.payload,
          metadata: input.metadata,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (response.ok) {
        return {
          success: true,
          channel: 'webhook',
          deliveredAt: new Date(),
          details: { type: 'webhook', httpStatus: response.status },
        };
      }

      const retryAfter = response.headers.get('retry-after');
      return {
        success: false,
        channel: 'webhook',
        error: `HTTP ${response.status} ${response.statusText}`,
        retryable: response.status >= 500 || response.status === 429,
        details: {
          type: 'webhook',
          httpStatus: response.status,
          retryAfter: retryAfter ? parseInt(retryAfter, 10) : undefined,
        },
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      this.logger.warn(`Webhook delivery failed to ${input.endpoint}: ${message}`);
      return {
        success: false,
        channel: 'webhook',
        error: message,
        retryable: true,
      };
    }
  }
}
