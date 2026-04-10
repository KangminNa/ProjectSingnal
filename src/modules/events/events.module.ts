import { Module, forwardRef } from '@nestjs/common';
import { EVENT_INGEST_LOG_REPOSITORY } from '@core/injection-tokens';
import { EventIngestionService } from './event-ingestion.service';
import { EventRouterService } from './event-router.service';
import { OutboxRelayService } from './outbox-relay.service';
import { EventsQueryService } from './events-query.service';
import { EventDispatcherService } from './event-dispatcher.service';
import { EventsController } from './events.controller';
import { EventIngestLogRepository } from './event-ingest-log.repository';
import { DeliveryModule } from '@modules/delivery/delivery.module';

@Module({
  imports: [forwardRef(() => DeliveryModule)],
  controllers: [EventsController],
  providers: [
    EventIngestionService,
    EventRouterService,
    OutboxRelayService,
    EventsQueryService,
    EventDispatcherService,
    { provide: EVENT_INGEST_LOG_REPOSITORY, useClass: EventIngestLogRepository },
  ],
  exports: [
    EventIngestionService,
    EventRouterService,
    EventsQueryService,
  ],
})
export class EventsModule {}
