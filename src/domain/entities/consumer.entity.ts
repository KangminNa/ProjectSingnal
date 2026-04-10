import { ConsumerType } from '@domain/types/consumer.types';

export interface Consumer {
  id: string;
  projectId: string;
  name: string;
  consumerType: ConsumerType;
  endpoint?: string;
  authConfigJson?: Record<string, unknown>;
  status: 'active' | 'inactive';
  createdAt: Date;
}
