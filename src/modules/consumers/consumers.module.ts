import { Module } from '@nestjs/common';
import { ConsumersController } from './controllers/consumers.controller';
import { SubscriptionsController } from './controllers/subscriptions.controller';
import { ConsumersCommandService } from './services/consumers-command.service';
import { ConsumersQueryService } from './services/consumers-query.service';
import { SubscriptionsCommandService } from './services/subscriptions-command.service';
import { SubscriptionsQueryService } from './services/subscriptions-query.service';
import { ConsumerRepository } from './repositories/consumer.repository';
import { SubscriptionRepository } from './repositories/subscription.repository';
import { CONSUMER_REPOSITORY, SUBSCRIPTION_REPOSITORY } from '@common/constants/injection-tokens';

@Module({
  controllers: [ConsumersController, SubscriptionsController],
  providers: [
    ConsumersCommandService,
    ConsumersQueryService,
    SubscriptionsCommandService,
    SubscriptionsQueryService,
    {
      provide: CONSUMER_REPOSITORY,
      useClass: ConsumerRepository,
    },
    {
      provide: SUBSCRIPTION_REPOSITORY,
      useClass: SubscriptionRepository,
    },
  ],
  exports: [CONSUMER_REPOSITORY, SUBSCRIPTION_REPOSITORY],
})
export class ConsumersModule {}
