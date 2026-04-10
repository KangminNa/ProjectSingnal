import { Injectable, Inject, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { EVENT_INGEST_LOG_REPOSITORY, EVENT_BUS } from '@common/constants/injection-tokens';
import { EventIngestLogRepository, EventIngestLog } from '@domain/ports/outbound/repositories/event-ingest-log.repository.port';
import { EventBus } from '@domain/ports/outbound/event-bus.port';
import { EventEnvelope } from '@domain/types/event-envelope';

const RELAY_INTERVAL_MS = 1000;
const RELAY_BATCH_SIZE = 50;

@Injectable()
export class OutboxRelayService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(OutboxRelayService.name);
  private intervalRef: NodeJS.Timeout | null = null;
  private isRelaying = false;

  constructor(
    @Inject(EVENT_INGEST_LOG_REPOSITORY) private readonly ingestLogRepo: EventIngestLogRepository,
    @Inject(EVENT_BUS) private readonly eventBus: EventBus,
  ) {}

  onModuleInit() {
    this.intervalRef = setInterval(() => this.relay(), RELAY_INTERVAL_MS);
    this.logger.log(`Outbox relay started (${RELAY_INTERVAL_MS}ms interval)`);
  }

  onModuleDestroy() {
    if (this.intervalRef) {
      clearInterval(this.intervalRef);
      this.intervalRef = null;
    }
  }

  async relay(): Promise<void> {
    if (this.isRelaying) return;
    this.isRelaying = true;

    try {
      const pending = await this.ingestLogRepo.listPending(RELAY_BATCH_SIZE);
      if (pending.length === 0) return;

      let succeeded = 0;
      let failed = 0;

      for (const log of pending) {
        try {
          const envelope = this.reconstructEnvelope(log);
          await this.eventBus.publish(envelope);
          await this.ingestLogRepo.markRelayed(log.id);
          succeeded++;
        } catch (error) {
          failed++;
          const message = error instanceof Error ? error.message : 'Unknown error';
          this.logger.error(`Failed to relay event ${log.eventId}: ${message}`);
          await this.ingestLogRepo.markFailed(log.id, message);
        }
      }

      if (succeeded > 0 || failed > 0) {
        this.logger.log(`Outbox relay batch: ${succeeded} relayed, ${failed} failed`);
      }
    } finally {
      this.isRelaying = false;
    }
  }

  private reconstructEnvelope(log: EventIngestLog): EventEnvelope {
    return {
      eventId: log.eventId,
      projectId: log.projectId,
      eventType: log.eventType,
      producer: log.producer,
      occurredAt: log.acceptedAt,
      priority: 'normal',
      routing: {},
      payload: {},
      metadata: {
        idempotencyKey: log.idempotencyKey,
      },
    };
  }
}
