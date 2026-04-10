import { Module } from '@nestjs/common';
import { DeliveryOrchestratorService } from './delivery-orchestrator.service';
import { TransportRegistry } from './transport.registry';
import { TransportInitializerService } from './transport-initializer.service';
import { DeliveryLogsQueryService } from './delivery-logs-query.service';
import { DeliveryPolicyService } from './delivery-policy.service';
import { PresenceService } from './presence.service';
import { AsyncDeliveryService } from './async-delivery.service';
import { ScheduledDeliveryProcessor } from './processors/scheduled-delivery.processor';
import { PushFallbackProcessor } from './processors/push-fallback.processor';
import { WebhookRetryProcessor } from './processors/webhook-retry.processor';
import { DeadLetterProcessor } from './processors/dead-letter.processor';
import { SocketIoModule } from '@infrastructure/transport/socketio/socketio.module';
import { WebhookModule } from '@infrastructure/transport/webhook/webhook.module';
import { PushModule } from '@infrastructure/transport/push/push.module';
import { EmailModule } from '@infrastructure/transport/email/email.module';

@Module({
  imports: [SocketIoModule, WebhookModule, PushModule, EmailModule],
  providers: [
    DeliveryOrchestratorService,
    TransportRegistry,
    TransportInitializerService,
    DeliveryLogsQueryService,
    DeliveryPolicyService,
    PresenceService,
    AsyncDeliveryService,
    ScheduledDeliveryProcessor,
    PushFallbackProcessor,
    WebhookRetryProcessor,
    DeadLetterProcessor,
  ],
  exports: [
    DeliveryOrchestratorService,
    TransportRegistry,
    DeliveryLogsQueryService,
    PresenceService,
  ],
})
export class DeliveryModule {}
