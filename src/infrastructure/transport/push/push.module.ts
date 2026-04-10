import { Module } from '@nestjs/common';
import { PushTransportAdapter } from './push-transport.adapter';
import { PUSH_TRANSPORT } from '@application/delivery/transport-initializer.service';

@Module({
  providers: [
    PushTransportAdapter,
    { provide: PUSH_TRANSPORT, useExisting: PushTransportAdapter },
  ],
  exports: [PushTransportAdapter, PUSH_TRANSPORT],
})
export class PushModule {}
