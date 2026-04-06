import { Module } from '@nestjs/common';
import { ConsumersModule } from '../consumers/consumers.module';
import { DeliveryLogsController } from './controllers/delivery-logs.controller';
import { DeliveryOrchestratorService } from './services/delivery-orchestrator.service';
import { DeliveryPolicyService } from './services/delivery-policy.service';
import { DeliveryLogsQueryService } from './services/delivery-logs-query.service';
import { DeliveryAdapterFactory } from './factories/delivery-adapter.factory';
import { RealtimeDeliveryStrategy } from './strategies/realtime-delivery.strategy';
import { PushDeliveryStrategy } from './strategies/push-delivery.strategy';
import { WebhookDeliveryStrategy } from './strategies/webhook-delivery.strategy';
import { EmailDeliveryStrategy } from './strategies/email-delivery.strategy';
import { DeliveryLogRepository } from './repositories/delivery-log.repository';
import { DeliveryPolicyRepository } from './repositories/delivery-policy.repository';
import {
  DELIVERY_LOG_REPOSITORY,
  DELIVERY_POLICY_REPOSITORY,
} from '@common/constants/injection-tokens';

@Module({
  imports: [ConsumersModule],
  controllers: [DeliveryLogsController],
  providers: [
    DeliveryOrchestratorService,
    DeliveryPolicyService,
    DeliveryLogsQueryService,
    DeliveryAdapterFactory,
    RealtimeDeliveryStrategy,
    PushDeliveryStrategy,
    WebhookDeliveryStrategy,
    EmailDeliveryStrategy,
    {
      provide: DELIVERY_LOG_REPOSITORY,
      useClass: DeliveryLogRepository,
    },
    {
      provide: DELIVERY_POLICY_REPOSITORY,
      useClass: DeliveryPolicyRepository,
    },
  ],
  exports: [DeliveryOrchestratorService, DELIVERY_LOG_REPOSITORY, DELIVERY_POLICY_REPOSITORY],
})
export class DeliveryModule {}
