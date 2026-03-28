import { Injectable, Inject, Logger, OnModuleInit } from '@nestjs/common';
import { EVENT_INGEST_LOG_REPOSITORY, EVENT_BUS } from '@common/constants/injection-tokens';
import { EventIngestLogRepository } from '@domain/ports/outbound/repositories/event-ingest-log.repository.port';
import { EventBus } from '@domain/ports/outbound/event-bus.port';

@Injectable()
export class OutboxRelayService implements OnModuleInit {
  private readonly logger = new Logger(OutboxRelayService.name);
  private intervalRef: NodeJS.Timeout | null = null;

  constructor(
    @Inject(EVENT_INGEST_LOG_REPOSITORY) private readonly ingestLogRepo: EventIngestLogRepository,
    @Inject(EVENT_BUS) private readonly eventBus: EventBus,
  ) {}

  onModuleInit() {
    this.intervalRef = setInterval(() => this.relay(), 1000);
    this.logger.log('Outbox relay started (1s interval)');
  }

  async relay(): Promise<void> {
    const pending = await this.ingestLogRepo.listPending(50);

    for (const log of pending) {
      try {
        // TODO: Reconstruct full EventEnvelope from stored data
        // For now, mark as relayed
        await this.ingestLogRepo.markRelayed(log.id);
      } catch (error) {
        this.logger.error(`Failed to relay event ${log.eventId}`, error);
        await this.ingestLogRepo.markFailed(log.id, error instanceof Error ? error.message : 'Unknown error');
      }
    }
  }
}
