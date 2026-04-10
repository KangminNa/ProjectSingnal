import { ConsumerType } from '@domain/types/consumer.types';
import { DeliveryInput, DeliveryResult } from '@domain/types/delivery.types';

export interface TransportAdapter {
  readonly type: ConsumerType;
  send(input: DeliveryInput): Promise<DeliveryResult>;
}
