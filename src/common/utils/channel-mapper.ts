import { ConsumerType } from '@domain/types/consumer.types';
import { DeliveryChannel } from '@domain/types/delivery.types';

const CONSUMER_TO_CHANNEL: Record<ConsumerType, DeliveryChannel> = {
  [ConsumerType.WEBSOCKET]: 'realtime',
  [ConsumerType.WEBHOOK]: 'webhook',
  [ConsumerType.PUSH]: 'push',
  [ConsumerType.EMAIL]: 'email',
};

export function toDeliveryChannel(consumerType: ConsumerType): DeliveryChannel {
  return CONSUMER_TO_CHANNEL[consumerType];
}
