import { Injectable } from '@nestjs/common';
import { ConsumerType } from '@domain/types/consumer.types';
import { TransportAdapter } from '@domain/ports/outbound/transport.adapter.port';

@Injectable()
export class TransportRegistry {
  private readonly adapters = new Map<ConsumerType, TransportAdapter>();

  register(type: ConsumerType, adapter: TransportAdapter): void {
    this.adapters.set(type, adapter);
  }

  resolve(type: ConsumerType): TransportAdapter | null {
    return this.adapters.get(type) ?? null;
  }

  supportedTypes(): ConsumerType[] {
    return Array.from(this.adapters.keys());
  }
}
