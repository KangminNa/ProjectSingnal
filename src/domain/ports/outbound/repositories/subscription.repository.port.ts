import { Subscription } from '@domain/entities/subscription.entity';
import { ConsumerTarget } from '@domain/types/consumer.types';

export interface CreateSubscriptionInput {
  projectId: string;
  consumerId: string;
  eventPattern: string;
  routingFilterJson?: Record<string, unknown>;
  policyId?: string;
}

export interface SubscriptionRepository {
  create(input: CreateSubscriptionInput): Promise<Subscription>;
  findById(id: string): Promise<Subscription | null>;
  listByProject(projectId: string): Promise<Subscription[]>;
  findTargets(projectId: string, eventType: string): Promise<ConsumerTarget[]>;
  updateStatus(id: string, status: string): Promise<void>;
}
