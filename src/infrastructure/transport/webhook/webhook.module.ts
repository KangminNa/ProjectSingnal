import { Module } from '@nestjs/common';
import { WebhookTransportAdapter } from './webhook-transport.adapter';
import { WEBHOOK_TRANSPORT } from '@application/delivery/transport-initializer.service';

@Module({
  providers: [
    WebhookTransportAdapter,
    { provide: WEBHOOK_TRANSPORT, useExisting: WebhookTransportAdapter },
  ],
  exports: [WebhookTransportAdapter, WEBHOOK_TRANSPORT],
})
export class WebhookModule {}
