import { Injectable, Inject } from '@nestjs/common';
import { DELIVERY_LOG_REPOSITORY } from '@core/injection-tokens';
import type { DeliveryLogRepository } from '@core/repository';
import type { DeliveryLog } from '@core/entities';

@Injectable()
export class DeliveryLogsQueryService {
  constructor(
    @Inject(DELIVERY_LOG_REPOSITORY) private readonly deliveryLogRepo: DeliveryLogRepository,
  ) {}

  async listByProject(projectId: string, limit = 50, offset = 0): Promise<DeliveryLog[]> {
    return this.deliveryLogRepo.listByProject(projectId, limit, offset);
  }

  async listByEvent(eventId: string): Promise<DeliveryLog[]> {
    return this.deliveryLogRepo.listByEvent(eventId);
  }

  async getStatsByProject(projectId: string): Promise<Record<string, number>> {
    return this.deliveryLogRepo.countByProject(projectId);
  }
}
