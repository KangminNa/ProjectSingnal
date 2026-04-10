import { Injectable, Inject, Logger, OnModuleInit } from '@nestjs/common';
import { EVENT_BUS } from '@common/constants/injection-tokens';
import { EventBus } from '@domain/ports/outbound/event-bus.port';
import { DeliveryOrchestratorService } from '@application/delivery/delivery-orchestrator.service';

@Injectable()
export class EventDispatcherService implements OnModuleInit {
  private readonly logger = new Logger(EventDispatcherService.name);

  constructor(
    @Inject(EVENT_BUS) private readonly eventBus: EventBus,
    private readonly deliveryOrchestrator: DeliveryOrchestratorService,
  ) {}

  async onModuleInit(): Promise<void> {
    await this.eventBus.subscribe('proj.>', async (event) => {
      this.logger.log(`Received event ${event.eventId} (${event.eventType}) for project ${event.projectId}`);
      try {
        await this.deliveryOrchestrator.deliver(event);
      } catch (error) {
        const msg = error instanceof Error ? error.message : 'Unknown';
        this.logger.error(`Delivery failed for event ${event.eventId}: ${msg}`);
      }
    });
    this.logger.log('Subscribed to all project events (proj.>)');
  }
}
