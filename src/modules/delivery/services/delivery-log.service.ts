import { Injectable, Inject } from '@nestjs/common';
import { DELIVERY_LOG_REPOSITORY } from '@common/constants/injection-tokens';
import { DeliveryLogRepository } from '@domain/ports/outbound/repositories/delivery-log.repository.port';
import { DeliveryLog } from '@domain/entities/delivery-log.entity';

@Injectable()
export class DeliveryLogService {
  constructor(
    @Inject(DELIVERY_LOG_REPOSITORY) private readonly deliveryLogRepo: DeliveryLogRepository,
  ) {}

  async listByProject(projectId: string): Promise<DeliveryLog[]> {
    return this.deliveryLogRepo.listByProject(projectId);
  }

  async listByEvent(eventId: string): Promise<DeliveryLog[]> {
    return this.deliveryLogRepo.listByEvent(eventId);
  }
}
