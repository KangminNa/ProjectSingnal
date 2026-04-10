import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { TransportRegistry } from './transport.registry';
import { HttpTransportAdapter } from '@infrastructure/transport/http/http-transport.adapter';
import { SocketIoTransportAdapter } from '@infrastructure/transport/socketio/socketio-transport.adapter';

/**
 * TransportInitializerService
 *
 * Registers both TransportAdapters into the Registry on startup.
 * To add a new protocol: inject into constructor + call register.
 */
@Injectable()
export class TransportInitializerService implements OnModuleInit {
  private readonly logger = new Logger(TransportInitializerService.name);

  constructor(
    private readonly registry: TransportRegistry,
    private readonly httpAdapter: HttpTransportAdapter,
    private readonly socketIoAdapter: SocketIoTransportAdapter,
  ) {}

  onModuleInit(): void {
    this.registry.register(this.httpAdapter);
    this.registry.register(this.socketIoAdapter);

    this.logger.log(`Transport protocols registered: ${this.registry.supportedProtocols().join(', ')}`);
  }
}
