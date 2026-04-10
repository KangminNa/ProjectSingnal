import { Injectable, Inject } from '@nestjs/common';
import { SUBSCRIPTION_REPOSITORY } from '@core/injection-tokens';
import type { SubscriptionRepository } from '@core/repository';
import type { Subscription } from '@core/entities';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';

@Injectable()
export class SubscriptionsCommandService {
  constructor(
    @Inject(SUBSCRIPTION_REPOSITORY) private readonly subscriptionRepo: SubscriptionRepository,
  ) {}

  async create(projectId: string, dto: CreateSubscriptionDto): Promise<Subscription> {
    return this.subscriptionRepo.create({
      projectId,
      consumerId: dto.consumerId,
      eventPattern: dto.eventPattern,
      routingFilterJson: dto.routingFilterJson,
      policyId: dto.policyId,
    });
  }

  async deactivate(subscriptionId: string): Promise<void> {
    await this.subscriptionRepo.updateStatus(subscriptionId, 'inactive');
  }
}
