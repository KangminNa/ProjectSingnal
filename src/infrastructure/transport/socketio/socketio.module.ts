import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { SocketIoTransportAdapter } from './socketio-transport.adapter';
import { SocketIoGateway } from './socketio.gateway';
import { SessionService } from './session.service';

@Module({
  imports: [JwtModule],
  providers: [SocketIoTransportAdapter, SocketIoGateway, SessionService],
  exports: [SocketIoTransportAdapter, SessionService],
})
export class SocketIoModule {}
