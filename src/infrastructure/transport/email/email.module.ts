import { Module } from '@nestjs/common';
import { EmailTransportAdapter } from './email-transport.adapter';
import { EMAIL_TRANSPORT } from '@application/delivery/transport-initializer.service';

@Module({
  providers: [
    EmailTransportAdapter,
    { provide: EMAIL_TRANSPORT, useExisting: EmailTransportAdapter },
  ],
  exports: [EmailTransportAdapter, EMAIL_TRANSPORT],
})
export class EmailModule {}
