import { Injectable, Inject } from '@nestjs/common';
import { DELIVERY_LOG_REPOSITORY } from '@common/constants/injection-tokens';
import { DeliveryLogRepository } from '@domain/ports/outbound/repositories/delivery-log.repository.port';
import { DeliveryLog } from '@domain/entities/delivery-log.entity';

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
