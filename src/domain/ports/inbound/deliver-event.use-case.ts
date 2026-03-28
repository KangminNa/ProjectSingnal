import { EventEnvelope } from '@common/types/event-envelope';

export interface DeliverEventUseCase {
  execute(event: EventEnvelope): Promise<void>;
}
