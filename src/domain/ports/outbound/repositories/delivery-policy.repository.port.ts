import { DeliveryPolicy } from '@domain/entities/delivery-policy.entity';

export interface CreateDeliveryPolicyInput {
  projectId: string;
  name: string;
  realtimeEnabled: boolean;
  pushFallbackEnabled: boolean;
  retryMaxAttempts: number;
  retryBackoffType: 'fixed' | 'exponential';
  retryBackoffValue: number;
  ttlSeconds: number;
}

export interface DeliveryPolicyRepository {
  create(input: CreateDeliveryPolicyInput): Promise<DeliveryPolicy>;
  findById(id: string): Promise<DeliveryPolicy | null>;
  listByProject(projectId: string): Promise<DeliveryPolicy[]>;
}
