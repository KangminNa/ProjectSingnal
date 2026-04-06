import { Injectable, Inject } from '@nestjs/common';
import { CONSUMER_REPOSITORY } from '@common/constants/injection-tokens';
import { ConsumerRepository } from '@domain/ports/outbound/repositories/consumer.repository.port';
import { RegisterConsumerDto } from '../dto/register-consumer.dto';
import { Consumer } from '@domain/entities/consumer.entity';
import { ConsumerType } from '@common/types/consumer.types';

@Injectable()
export class ConsumersCommandService {
  constructor(@Inject(CONSUMER_REPOSITORY) private readonly consumerRepo: ConsumerRepository) {}

  async register(projectId: string, dto: RegisterConsumerDto): Promise<Consumer> {
    return this.consumerRepo.create({
      projectId,
      name: dto.name,
      consumerType: dto.consumerType as ConsumerType,
      endpoint: dto.endpoint,
      authConfigJson: dto.authConfigJson,
    });
  }
}
