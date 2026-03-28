import { DeliveryChannel, DeliveryStatus } from '@common/types/delivery.types';

export interface DeliveryLog {
  id: string;
  projectId: string;
  eventId: string;
  consumerId: string;
  channelType: DeliveryChannel;
  status: DeliveryStatus;
  attemptCount: number;
  deliveredAt?: Date;
  lastError?: string;
  createdAt: Date;
}
