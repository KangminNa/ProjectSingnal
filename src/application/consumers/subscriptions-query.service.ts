import { Injectable, Inject } from '@nestjs/common';
import { SUBSCRIPTION_REPOSITORY } from '@common/constants/injection-tokens';
import { SubscriptionRepository } from '@domain/ports/outbound/repositories/subscription.repository.port';
import { Subscription } from '@domain/entities/subscription.entity';

@Injectable()
export class SubscriptionsQueryService {
  constructor(
    @Inject(SUBSCRIPTION_REPOSITORY) private readonly subscriptionRepo: SubscriptionRepository,
  ) {}

  async listByProject(projectId: string): Promise<Subscription[]> {
    return this.subscriptionRepo.listByProject(projectId);
  }
}
