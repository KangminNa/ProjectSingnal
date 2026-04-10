import { Injectable, Inject } from '@nestjs/common';
import { EVENT_INGEST_LOG_REPOSITORY } from '@common/constants/injection-tokens';
import { EventIngestLogRepository, EventIngestLog } from '@domain/ports/outbound/repositories/event-ingest-log.repository.port';

@Injectable()
export class EventsQueryService {
  constructor(
    @Inject(EVENT_INGEST_LOG_REPOSITORY) private readonly ingestLogRepo: EventIngestLogRepository,
  ) {}

  async listIngestLogs(projectId: string, limit = 50, offset = 0): Promise<EventIngestLog[]> {
    return this.ingestLogRepo.listByProject(projectId, limit, offset);
  }

  async getIngestStats(projectId: string) {
    return this.ingestLogRepo.countByProject(projectId);
  }
}
