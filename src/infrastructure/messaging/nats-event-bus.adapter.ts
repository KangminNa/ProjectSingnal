import { Injectable, Inject, Logger } from '@nestjs/common';
import { NatsConnection, StringCodec, JetStreamClient } from 'nats';
import { EventBus, EventHandler } from '@domain/ports/outbound/event-bus.port';
import { EventEnvelope } from '@domain/types/event-envelope';
import { NATS_CONNECTION } from './nats.provider';

@Injectable()
export class NatsEventBusAdapter implements EventBus {
  private readonly logger = new Logger(NatsEventBusAdapter.name);
  private readonly sc = StringCodec();
  private js: JetStreamClient | null = null;

  constructor(@Inject(NATS_CONNECTION) private readonly nc: NatsConnection) {}

  async publish(event: EventEnvelope): Promise<void> {
    const subject = `proj.${event.projectId}.${event.eventType}`;
    const data = this.sc.encode(JSON.stringify(event));

    try {
      this.nc.publish(subject, data);
      await this.nc.flush();
      this.logger.debug(`Published event to ${subject}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown NATS error';
      this.logger.error(`Failed to publish event to ${subject}: ${message}`);
      throw new Error(`NATS publish failed: ${message}`);
    }
  }

  async subscribe(subject: string, handler: EventHandler): Promise<void> {
    const sub = this.nc.subscribe(subject);
    this.logger.log(`Subscribed to ${subject}`);

    (async () => {
      for await (const msg of sub) {
        try {
          const event: EventEnvelope = JSON.parse(this.sc.decode(msg.data));
          await handler(event);
        } catch (error) {
          this.logger.error(`Error handling message on ${subject}`, error);
        }
      }
    })();
  }
}
