import { ConsumerType, DeliveryChannel, TransportProtocol } from '@core/enums';

/** ConsumerType → DeliveryChannel (로그 기록용 라벨) */
const CONSUMER_TO_CHANNEL: Record<ConsumerType, DeliveryChannel> = {
  [ConsumerType.WEBSOCKET]: 'realtime',
  [ConsumerType.WEBHOOK]: 'webhook',
  [ConsumerType.PUSH]: 'push',
  [ConsumerType.EMAIL]: 'email',
};

export function toDeliveryChannel(consumerType: ConsumerType): DeliveryChannel {
  return CONSUMER_TO_CHANNEL[consumerType];
}

/** ConsumerType → TransportProtocol (실제 배달 프로토콜 분기) */
export function toProtocol(consumerType: ConsumerType): TransportProtocol {
  return consumerType === ConsumerType.WEBSOCKET
    ? TransportProtocol.WEBSOCKET
    : TransportProtocol.HTTP;
}
