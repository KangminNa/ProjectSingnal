import { Module } from '@nestjs/common';
import { AsyncDeliveryService } from './services/async-delivery.service';
import { ScheduledDeliveryProcessor } from './processors/scheduled-delivery.processor';
import { PushFallbackProcessor } from './processors/push-fallback.processor';
import { WebhookRetryProcessor } from './processors/webhook-retry.processor';
import { DeadLetterProcessor } from './processors/dead-letter.processor';

@Module({
  providers: [
    AsyncDeliveryService,
    ScheduledDeliveryProcessor,
    PushFallbackProcessor,
    WebhookRetryProcessor,
    DeadLetterProcessor,
  ],
  exports: [AsyncDeliveryService],
})
export class AsyncDeliveryModule {}
