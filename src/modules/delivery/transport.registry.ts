import { Injectable } from '@nestjs/common';
import type { TransportProtocol, TransportAdapter } from '@core/transport';

/**
 * TransportRegistry -- manages protocol-specific adapters.
 *
 * Only HTTP and WEBSOCKET are registered.
 * Routing is by TransportProtocol, not ConsumerType.
 */
@Injectable()
export class TransportRegistry {
  private readonly adapters = new Map<TransportProtocol, TransportAdapter>();

  register(adapter: TransportAdapter): void {
    this.adapters.set(adapter.protocol, adapter);
  }

  resolve(protocol: TransportProtocol): TransportAdapter | null {
    return this.adapters.get(protocol) ?? null;
  }

  supportedProtocols(): TransportProtocol[] {
    return Array.from(this.adapters.keys());
  }
}
