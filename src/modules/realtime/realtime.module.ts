import { Global, Module } from '@nestjs/common';
import { ConnectionsController } from './controllers/connections.controller';
import { EventsGateway } from './gateways/events.gateway';
import { RealtimeDeliveryService } from './services/realtime-delivery.service';
import { PresenceService } from './services/presence.service';
import { SessionService } from './services/session.service';
import { REALTIME_GATEWAY } from '@common/constants/injection-tokens';

@Global()
@Module({
  controllers: [ConnectionsController],
  providers: [
    EventsGateway,
    RealtimeDeliveryService,
    PresenceService,
    SessionService,
    {
      provide: REALTIME_GATEWAY,
      useExisting: RealtimeDeliveryService,
    },
  ],
  exports: [REALTIME_GATEWAY, PresenceService, SessionService],
})
export class RealtimeModule {}
