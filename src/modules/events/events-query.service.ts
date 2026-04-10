import { Injectable, Inject } from '@nestjs/common';
import { EVENT_INGEST_LOG_REPOSITORY } from '@core/injection-tokens';
import type { EventIngestLogRepository, EventIngestLog } from '@core/repository';

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
