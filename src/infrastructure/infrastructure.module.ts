import { Module } from '@nestjs/common';
import { PersistenceModule } from './persistence/persistence.module';
import { MessagingModule } from './messaging/messaging.module';
import { CacheModule } from './cache/cache.module';
import { QueueModule } from './queue/queue.module';
import { SocketIoModule } from './transport/socketio/socketio.module';
import { WebhookModule } from './transport/webhook/webhook.module';
import { PushModule } from './transport/push/push.module';
import { EmailModule } from './transport/email/email.module';
import { ObservabilityModule } from './observability/observability.module';

@Module({
  imports: [
    PersistenceModule,
    MessagingModule,
    CacheModule,
    QueueModule,
    SocketIoModule,
    WebhookModule,
    PushModule,
    EmailModule,
    ObservabilityModule,
  ],
  exports: [
    PersistenceModule,
    MessagingModule,
    CacheModule,
    QueueModule,
    SocketIoModule,
    WebhookModule,
    PushModule,
    EmailModule,
  ],
})
export class InfrastructureModule {}
