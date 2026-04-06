import { Module } from '@nestjs/common';
import { EventsController } from './controllers/events.controller';
import { EventIngestionService } from './services/event-ingestion.service';
import { EventRouterService } from './services/event-router.service';
import { EventsQueryService } from './services/events-query.service';
import { OutboxRelayService } from './services/outbox-relay.service';
import { EventIngestLogRepository } from './repositories/event-ingest-log.repository';
import { EVENT_INGEST_LOG_REPOSITORY } from '@common/constants/injection-tokens';

@Module({
  controllers: [EventsController],
  providers: [
    EventIngestionService,
    EventRouterService,
    EventsQueryService,
    OutboxRelayService,
    {
      provide: EVENT_INGEST_LOG_REPOSITORY,
      useClass: EventIngestLogRepository,
    },
  ],
  exports: [EVENT_INGEST_LOG_REPOSITORY],
})
export class EventsModule {}
