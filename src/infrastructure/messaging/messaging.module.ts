import { Global, Module } from '@nestjs/common';
import { NatsProvider } from './nats.provider';
import { NatsEventBusAdapter } from './nats-event-bus.adapter';
import { EVENT_BUS } from '@core/injection-tokens';

@Global()
@Module({
  providers: [
    NatsProvider,
    {
      provide: EVENT_BUS,
      useClass: NatsEventBusAdapter,
    },
    NatsEventBusAdapter,
  ],
  exports: [EVENT_BUS, NatsProvider],
})
export class MessagingModule {}
