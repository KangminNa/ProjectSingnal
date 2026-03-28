import { DeliveryLog } from '@domain/entities/delivery-log.entity';
import { DeliveryChannel, DeliveryStatus } from '@common/types/delivery.types';

export interface CreateDeliveryLogInput {
  projectId: string;
  eventId: string;
  consumerId: string;
  channelType: DeliveryChannel;
  status: DeliveryStatus;
  lastError?: string;
}

export interface DeliveryLogRepository {
  create(input: CreateDeliveryLogInput): Promise<DeliveryLog>;
  updateStatus(id: string, status: DeliveryStatus, error?: string): Promise<void>;
  incrementAttempt(id: string): Promise<void>;
  listByProject(projectId: string, limit?: number, offset?: number): Promise<DeliveryLog[]>;
  listByEvent(eventId: string): Promise<DeliveryLog[]>;
  countByProject(projectId: string): Promise<Record<string, number>>;
}
