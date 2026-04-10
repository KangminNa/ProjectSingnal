import { Consumer } from '@domain/entities/consumer.entity';
import { ConsumerType } from '@domain/types/consumer.types';

export interface RegisterConsumerInput {
  projectId: string;
  name: string;
  consumerType: ConsumerType;
  endpoint?: string;
  authConfigJson?: Record<string, unknown>;
}

export interface ConsumerRepository {
  create(input: RegisterConsumerInput): Promise<Consumer>;
  findById(id: string): Promise<Consumer | null>;
  listByProject(projectId: string): Promise<Consumer[]>;
  updateStatus(id: string, status: string): Promise<void>;
}
