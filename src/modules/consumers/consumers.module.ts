import { Module } from '@nestjs/common';
import { ConsumersController } from './controllers/consumers.controller';
import { SubscriptionsController } from './controllers/subscriptions.controller';
import { ConsumersService } from './services/consumers.service';
import { SubscriptionsService } from './services/subscriptions.service';
import { ConsumerRepository } from './repositories/consumer.repository';
import { SubscriptionRepository } from './repositories/subscription.repository';
import { CONSUMER_REPOSITORY, SUBSCRIPTION_REPOSITORY } from '@common/constants/injection-tokens';

@Module({
  controllers: [ConsumersController, SubscriptionsController],
  providers: [
    ConsumersService,
    SubscriptionsService,
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
