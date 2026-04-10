import { Module } from '@nestjs/common';
import { ConsumersCommandService } from './consumers-command.service';
import { ConsumersQueryService } from './consumers-query.service';
import { SubscriptionsCommandService } from './subscriptions-command.service';
import { SubscriptionsQueryService } from './subscriptions-query.service';

@Module({
  providers: [
    ConsumersCommandService,
    ConsumersQueryService,
    SubscriptionsCommandService,
    SubscriptionsQueryService,
  ],
  exports: [
    ConsumersCommandService,
    ConsumersQueryService,
    SubscriptionsCommandService,
    SubscriptionsQueryService,
  ],
})
export class ConsumersModule {}
