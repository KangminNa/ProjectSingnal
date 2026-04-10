import { Injectable, Inject } from '@nestjs/common';
import { SUBSCRIPTION_REPOSITORY } from '@core/injection-tokens';
import type { SubscriptionRepository } from '@core/repository';
import type { Subscription } from '@core/entities';

@Injectable()
export class SubscriptionsQueryService {
  constructor(
    @Inject(SUBSCRIPTION_REPOSITORY) private readonly subscriptionRepo: SubscriptionRepository,
  ) {}

  async listByProject(projectId: string): Promise<Subscription[]> {
    return this.subscriptionRepo.listByProject(projectId);
  }
}
