import { Injectable, Inject } from '@nestjs/common';
import { CONSUMER_REPOSITORY } from '@core/injection-tokens';
import type { ConsumerRepository } from '@core/repository';
import type { Consumer } from '@core/entities';
import { RegisterConsumerDto } from './dto/register-consumer.dto';

@Injectable()
export class ConsumersCommandService {
  constructor(@Inject(CONSUMER_REPOSITORY) private readonly consumerRepo: ConsumerRepository) {}

  async register(projectId: string, dto: RegisterConsumerDto): Promise<Consumer> {
    return this.consumerRepo.create({
      projectId,
      name: dto.name,
      consumerType: dto.consumerType,
      endpoint: dto.endpoint,
      authConfigJson: dto.authConfigJson,
    });
  }
}
