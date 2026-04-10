import { Global, Module } from '@nestjs/common';
import { DrizzleProvider } from './drizzle.provider';
import { ProjectRepository } from './repositories/project.repository';
import { ApiKeyRepository } from './repositories/api-key.repository';
import { ConsumerRepository } from './repositories/consumer.repository';
import { SubscriptionRepository } from './repositories/subscription.repository';
import { DeliveryLogRepository } from './repositories/delivery-log.repository';
import { DeliveryPolicyRepository } from './repositories/delivery-policy.repository';
import { EventIngestLogRepository } from './repositories/event-ingest-log.repository';
import { UserRepository } from './repositories/user.repository';
import {
  PROJECT_REPOSITORY, API_KEY_REPOSITORY, CONSUMER_REPOSITORY,
  SUBSCRIPTION_REPOSITORY, DELIVERY_LOG_REPOSITORY, DELIVERY_POLICY_REPOSITORY,
  EVENT_INGEST_LOG_REPOSITORY, USER_REPOSITORY,
} from '@common/constants/injection-tokens';

@Global()
@Module({
  providers: [
    DrizzleProvider,
    { provide: PROJECT_REPOSITORY, useClass: ProjectRepository },
    { provide: API_KEY_REPOSITORY, useClass: ApiKeyRepository },
    { provide: CONSUMER_REPOSITORY, useClass: ConsumerRepository },
    { provide: SUBSCRIPTION_REPOSITORY, useClass: SubscriptionRepository },
    { provide: DELIVERY_LOG_REPOSITORY, useClass: DeliveryLogRepository },
    { provide: DELIVERY_POLICY_REPOSITORY, useClass: DeliveryPolicyRepository },
    { provide: EVENT_INGEST_LOG_REPOSITORY, useClass: EventIngestLogRepository },
    { provide: USER_REPOSITORY, useClass: UserRepository },
  ],
  exports: [
    DrizzleProvider,
    PROJECT_REPOSITORY, API_KEY_REPOSITORY, CONSUMER_REPOSITORY,
    SUBSCRIPTION_REPOSITORY, DELIVERY_LOG_REPOSITORY, DELIVERY_POLICY_REPOSITORY,
    EVENT_INGEST_LOG_REPOSITORY, USER_REPOSITORY,
  ],
})
export class PersistenceModule {}
