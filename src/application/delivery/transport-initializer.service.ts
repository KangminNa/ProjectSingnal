import { Injectable, Inject, OnModuleInit, Logger, Optional } from '@nestjs/common';
import { TransportRegistry } from './transport.registry';
import { ConsumerType } from '@domain/types/consumer.types';
import { TransportAdapter } from '@domain/ports/outbound/transport.adapter.port';

export const SOCKETIO_TRANSPORT = Symbol('SOCKETIO_TRANSPORT');
export const WEBHOOK_TRANSPORT = Symbol('WEBHOOK_TRANSPORT');
export const PUSH_TRANSPORT = Symbol('PUSH_TRANSPORT');
export const EMAIL_TRANSPORT = Symbol('EMAIL_TRANSPORT');

@Injectable()
export class TransportInitializerService implements OnModuleInit {
  private readonly logger = new Logger(TransportInitializerService.name);

  constructor(
    private readonly registry: TransportRegistry,
    @Inject(SOCKETIO_TRANSPORT) @Optional() private readonly socketio?: TransportAdapter,
    @Inject(WEBHOOK_TRANSPORT) @Optional() private readonly webhook?: TransportAdapter,
    @Inject(PUSH_TRANSPORT) @Optional() private readonly push?: TransportAdapter,
    @Inject(EMAIL_TRANSPORT) @Optional() private readonly email?: TransportAdapter,
  ) {}

  onModuleInit(): void {
    if (this.socketio) this.registry.register(ConsumerType.WEBSOCKET, this.socketio);
    if (this.webhook) this.registry.register(ConsumerType.WEBHOOK, this.webhook);
    if (this.push) this.registry.register(ConsumerType.PUSH, this.push);
    if (this.email) this.registry.register(ConsumerType.EMAIL, this.email);

    this.logger.log(`Transport adapters registered: ${this.registry.supportedTypes().join(', ')}`);
  }
}
