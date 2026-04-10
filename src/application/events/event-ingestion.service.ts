import { Injectable, Inject, Logger } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { EVENT_INGEST_LOG_REPOSITORY } from '@common/constants/injection-tokens';
import { EventIngestLogRepository } from '@domain/ports/outbound/repositories/event-ingest-log.repository.port';
import { ConflictException } from '@common/exceptions/domain.exception';
import { EventEnvelope } from '@domain/types/event-envelope';
import { PublishEventDto } from '@api/dto/events/publish-event.dto';

@Injectable()
export class EventIngestionService {
  private readonly logger = new Logger(EventIngestionService.name);

  constructor(
    @Inject(EVENT_INGEST_LOG_REPOSITORY) private readonly ingestLogRepo: EventIngestLogRepository,
  ) {}

  async ingest(projectId: string, dto: PublishEventDto): Promise<EventEnvelope> {
    if (dto.idempotencyKey) {
      const existing = await this.ingestLogRepo.findByIdempotencyKey(
        projectId,
        dto.idempotencyKey,
      );
      if (existing) {
        throw new ConflictException(
          `Event with idempotency key "${dto.idempotencyKey}" already exists`,
        );
      }
    }

    const eventId = `evt_${uuidv4()}`;

    const envelope: EventEnvelope = {
      eventId,
      projectId,
      eventType: dto.eventType,
      producer: dto.producer,
      occurredAt: new Date(),
      deliverAt: dto.deliverAt ? new Date(dto.deliverAt) : null,
      ttlSeconds: dto.ttlSeconds,
      priority: dto.priority,
      routing: dto.routing,
      payload: dto.payload,
      metadata: {
        idempotencyKey: dto.idempotencyKey,
      },
    };

    await this.ingestLogRepo.create({
      projectId,
      eventId,
      eventType: dto.eventType,
      producer: dto.producer,
      idempotencyKey: dto.idempotencyKey,
    });

    this.logger.log(`Ingested event ${eventId} for project ${projectId}`);
    return envelope;
  }
}
