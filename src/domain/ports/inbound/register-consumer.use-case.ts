import { Consumer } from '@domain/entities/consumer.entity';
import { ConsumerType } from '@domain/types/consumer.types';

export interface RegisterConsumerCommand {
  projectId: string;
  name: string;
  consumerType: ConsumerType;
  endpoint?: string;
  authConfigJson?: Record<string, unknown>;
}

export interface RegisterConsumerUseCase {
  execute(command: RegisterConsumerCommand): Promise<Consumer>;
}
