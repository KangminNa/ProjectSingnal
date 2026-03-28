import { Injectable, Inject } from '@nestjs/common';
import { SUBSCRIPTION_REPOSITORY } from '@common/constants/injection-tokens';
import { SubscriptionRepository } from '@domain/ports/outbound/repositories/subscription.repository.port';
import { CreateSubscriptionDto } from '../dto/create-subscription.dto';
import { Subscription } from '@domain/entities/subscription.entity';

@Injectable()
export class SubscriptionsService {
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

  async listByProject(projectId: string): Promise<Subscription[]> {
    return this.subscriptionRepo.listByProject(projectId);
  }

  async deactivate(subscriptionId: string): Promise<void> {
    await this.subscriptionRepo.updateStatus(subscriptionId, 'inactive');
  }
}
