import { EventEnvelope } from '@common/types/event-envelope';

export type EventHandler = (event: EventEnvelope) => Promise<void>;

export interface EventBus {
  publish(event: EventEnvelope): Promise<void>;
  subscribe(subject: string, handler: EventHandler): Promise<void>;
}
