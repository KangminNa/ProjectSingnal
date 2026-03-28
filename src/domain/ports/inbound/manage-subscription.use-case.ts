import { Subscription } from '@domain/entities/subscription.entity';

export interface CreateSubscriptionCommand {
  projectId: string;
  consumerId: string;
  eventPattern: string;
  routingFilterJson?: Record<string, unknown>;
  policyId?: string;
}

export interface ManageSubscriptionUseCase {
  create(command: CreateSubscriptionCommand): Promise<Subscription>;
  listByProject(projectId: string): Promise<Subscription[]>;
  deactivate(subscriptionId: string): Promise<void>;
}
