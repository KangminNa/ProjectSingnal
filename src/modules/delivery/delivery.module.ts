import { Module } from '@nestjs/common';
import { DELIVERY_LOG_REPOSITORY, DELIVERY_POLICY_REPOSITORY } from '@core/injection-tokens';
import { DeliveryOrchestratorService } from './delivery-orchestrator.service';
import { TransportRegistry } from './transport.registry';
import { TransportInitializerService } from './transport-initializer.service';
import { DeliveryLogsQueryService } from './delivery-logs-query.service';
import { DeliveryPolicyService } from './delivery-policy.service';
import { PresenceService } from './presence.service';
import { AsyncDeliveryService } from './async-delivery.service';
import { DeliveryLogsController } from './delivery-logs.controller';
import { ConnectionsController } from './connections.controller';
import { DeliveryLogRepository } from './delivery-log.repository';
import { DeliveryPolicyRepository } from './delivery-policy.repository';
import { ScheduledDeliveryProcessor } from './processors/scheduled-delivery.processor';
import { PushFallbackProcessor } from './processors/push-fallback.processor';
import { WebhookRetryProcessor } from './processors/webhook-retry.processor';
import { DeadLetterProcessor } from './processors/dead-letter.processor';
import { SocketIoModule } from '@infrastructure/transport/socketio/socketio.module';
import { HttpTransportModule } from '@infrastructure/transport/http/http.module';
import { ConsumersModule } from '@modules/consumers/consumers.module';

@Module({
  imports: [SocketIoModule, HttpTransportModule, ConsumersModule],
  controllers: [DeliveryLogsController, ConnectionsController],
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
    { provide: DELIVERY_LOG_REPOSITORY, useClass: DeliveryLogRepository },
    { provide: DELIVERY_POLICY_REPOSITORY, useClass: DeliveryPolicyRepository },
  ],
  exports: [
    DeliveryOrchestratorService,
    TransportRegistry,
    DeliveryLogsQueryService,
    PresenceService,
  ],
})
export class DeliveryModule {}
