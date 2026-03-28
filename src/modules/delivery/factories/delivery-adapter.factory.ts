import { Injectable } from '@nestjs/common';
import { ConsumerType } from '@common/types/consumer.types';
import { DeliveryAdapter } from '@domain/ports/outbound/delivery-adapter.port';
import { RealtimeDeliveryStrategy } from '../strategies/realtime-delivery.strategy';
import { PushDeliveryStrategy } from '../strategies/push-delivery.strategy';
import { WebhookDeliveryStrategy } from '../strategies/webhook-delivery.strategy';
import { EmailDeliveryStrategy } from '../strategies/email-delivery.strategy';

@Injectable()
export class DeliveryAdapterFactory {
  private readonly adapters: DeliveryAdapter[];

  constructor(
    realtimeStrategy: RealtimeDeliveryStrategy,
    pushStrategy: PushDeliveryStrategy,
    webhookStrategy: WebhookDeliveryStrategy,
    emailStrategy: EmailDeliveryStrategy,
  ) {
    this.adapters = [realtimeStrategy, pushStrategy, webhookStrategy, emailStrategy];
  }

  getAdapter(consumerType: ConsumerType): DeliveryAdapter | null {
    return this.adapters.find((a) => a.canHandle(consumerType)) ?? null;
  }
}
