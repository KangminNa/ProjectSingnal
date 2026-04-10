import { Module } from '@nestjs/common';
import { HttpTransportAdapter } from './http-transport.adapter';

@Module({
  providers: [HttpTransportAdapter],
  exports: [HttpTransportAdapter],
})
export class HttpTransportModule {}
