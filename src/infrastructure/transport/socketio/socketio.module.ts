import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { SocketIoTransportAdapter } from './socketio-transport.adapter';
import { SocketIoGateway } from './socketio.gateway';
import { SessionService } from './session.service';
import { SOCKETIO_TRANSPORT } from '@application/delivery/transport-initializer.service';

@Module({
  imports: [JwtModule],
  providers: [
    SocketIoTransportAdapter,
    SocketIoGateway,
    SessionService,
    { provide: SOCKETIO_TRANSPORT, useExisting: SocketIoTransportAdapter },
  ],
  exports: [SocketIoTransportAdapter, SessionService, SOCKETIO_TRANSPORT],
})
export class SocketIoModule {}
