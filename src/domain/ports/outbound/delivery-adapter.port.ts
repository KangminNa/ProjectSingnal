import { ConsumerType } from '@common/types/consumer.types';
import { DeliveryInput, DeliveryResult } from '@common/types/delivery.types';

export interface DeliveryAdapter {
  canHandle(type: ConsumerType): boolean;
  deliver(input: DeliveryInput): Promise<DeliveryResult>;
}
