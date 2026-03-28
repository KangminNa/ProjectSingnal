import { EventEnvelope } from '@common/types/event-envelope';

export interface PublishEventCommand {
  projectId: string;
  eventType: string;
  producer: string;
  deliverAt?: Date | null;
  ttlSeconds?: number;
  priority?: 'low' | 'normal' | 'high' | 'urgent';
  routing: {
    users?: string[];
    topics?: string[];
    channels?: string[];
  };
  payload: Record<string, unknown>;
  idempotencyKey?: string;
}

export interface PublishEventUseCase {
  execute(command: PublishEventCommand): Promise<EventEnvelope>;
}
