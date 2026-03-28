import { Injectable } from '@nestjs/common';
import { ConsumerType } from '@common/types/consumer.types';
import { DeliveryAdapter } from '@domain/ports/outbound/delivery-adapter.port';
import { RealtimeDeliveryStrategy } from '../strategies/realtime-delivery.strategy';
import { PushDeliveryStrategy } from '../strategies/push-delivery.strategy';
import { WebhookDeliveryStrategy } from '../strategies/webhook-delivery.strategy';
import { EmailDeliveryStrategy } from '../strategies/email-delivery.strategy';

@Injectable()
export class DeliveryAdapterFactory {
  private readonly registry = new Map<ConsumerType, DeliveryAdapter>();

  constructor(
    realtimeStrategy: RealtimeDeliveryStrategy,
    pushStrategy: PushDeliveryStrategy,
    webhookStrategy: WebhookDeliveryStrategy,
    emailStrategy: EmailDeliveryStrategy,
  ) {
    this.register(ConsumerType.WEBSOCKET, realtimeStrategy);
    this.register(ConsumerType.PUSH, pushStrategy);
    this.register(ConsumerType.WEBHOOK, webhookStrategy);
    this.register(ConsumerType.EMAIL, emailStrategy);
  }

  register(type: ConsumerType, adapter: DeliveryAdapter): void {
    this.registry.set(type, adapter);
  }

  getAdapter(consumerType: ConsumerType): DeliveryAdapter | null {
    return this.registry.get(consumerType) ?? null;
  }

  getSupportedTypes(): ConsumerType[] {
    return Array.from(this.registry.keys());
  }
}
