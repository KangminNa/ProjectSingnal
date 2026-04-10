import { Injectable, Inject, Logger } from '@nestjs/common';
import { EVENT_BUS } from '@core/injection-tokens';
import type { EventBus, EventEnvelope } from '@core/event-bus';

@Injectable()
export class EventRouterService {
  private readonly logger = new Logger(EventRouterService.name);

  constructor(@Inject(EVENT_BUS) private readonly eventBus: EventBus) {}

  async route(event: EventEnvelope): Promise<void> {
    await this.eventBus.publish(event);
    this.logger.log(`Routed event ${event.eventId} to NATS`);
  }
}
