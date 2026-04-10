import { Module, forwardRef } from '@nestjs/common';
import { EventIngestionService } from './event-ingestion.service';
import { EventRouterService } from './event-router.service';
import { OutboxRelayService } from './outbox-relay.service';
import { EventsQueryService } from './events-query.service';
import { EventDispatcherService } from './event-dispatcher.service';
import { DeliveryModule } from '@application/delivery/delivery.module';

@Module({
  imports: [forwardRef(() => DeliveryModule)],
  providers: [
    EventIngestionService,
    EventRouterService,
    OutboxRelayService,
    EventsQueryService,
    EventDispatcherService,
  ],
  exports: [
    EventIngestionService,
    EventRouterService,
    EventsQueryService,
  ],
})
export class EventsModule {}
