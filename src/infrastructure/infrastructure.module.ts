import { Module } from '@nestjs/common';
import { PersistenceModule } from './persistence/persistence.module';
import { MessagingModule } from './messaging/messaging.module';
import { CacheModule } from './cache/cache.module';
import { QueueModule } from './queue/queue.module';
import { SocketIoModule } from './transport/socketio/socketio.module';
import { HttpTransportModule } from './transport/http/http.module';
import { ObservabilityModule } from './observability/observability.module';

@Module({
  imports: [
    PersistenceModule,
    MessagingModule,
    CacheModule,
    QueueModule,
    SocketIoModule,
    HttpTransportModule,
    ObservabilityModule,
  ],
  exports: [
    PersistenceModule,
    MessagingModule,
    CacheModule,
    QueueModule,
    SocketIoModule,
    HttpTransportModule,
  ],
})
export class InfrastructureModule {}
