import { Injectable, Inject } from '@nestjs/common';
import { CONSUMER_REPOSITORY } from '@core/injection-tokens';
import type { ConsumerRepository } from '@core/repository';
import type { Consumer } from '@core/entities';

@Injectable()
export class ConsumersQueryService {
  constructor(@Inject(CONSUMER_REPOSITORY) private readonly consumerRepo: ConsumerRepository) {}

  async listByProject(projectId: string): Promise<Consumer[]> {
    return this.consumerRepo.listByProject(projectId);
  }

  async findById(id: string): Promise<Consumer | null> {
    return this.consumerRepo.findById(id);
  }
}
