import { Module } from '@nestjs/common';
import { CONSUMER_REPOSITORY, SUBSCRIPTION_REPOSITORY } from '@core/injection-tokens';
import { ConsumersCommandService } from './consumers-command.service';
import { ConsumersQueryService } from './consumers-query.service';
import { SubscriptionsCommandService } from './subscriptions-command.service';
import { SubscriptionsQueryService } from './subscriptions-query.service';
import { ConsumersController } from './consumers.controller';
import { SubscriptionsController } from './subscriptions.controller';
import { ConsumerRepository } from './consumer.repository';
import { SubscriptionRepository } from './subscription.repository';

@Module({
  controllers: [ConsumersController, SubscriptionsController],
  providers: [
    ConsumersCommandService,
    ConsumersQueryService,
    SubscriptionsCommandService,
    SubscriptionsQueryService,
    { provide: CONSUMER_REPOSITORY, useClass: ConsumerRepository },
    { provide: SUBSCRIPTION_REPOSITORY, useClass: SubscriptionRepository },
  ],
  exports: [
    CONSUMER_REPOSITORY,
    SUBSCRIPTION_REPOSITORY,
    ConsumersCommandService,
    ConsumersQueryService,
    SubscriptionsCommandService,
    SubscriptionsQueryService,
  ],
})
export class ConsumersModule {}
