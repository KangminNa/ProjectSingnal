import { Injectable, Inject } from '@nestjs/common';
import { CONSUMER_REPOSITORY } from '@common/constants/injection-tokens';
import { ConsumerRepository } from '@domain/ports/outbound/repositories/consumer.repository.port';
import { Consumer } from '@domain/entities/consumer.entity';

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
