import { EventEnvelope } from '@domain/types/event-envelope';

export interface DeliverEventUseCase {
  execute(event: EventEnvelope): Promise<void>;
}
