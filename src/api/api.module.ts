import { Module } from '@nestjs/common';
import { AuthController } from './rest/auth.controller';
import { ProjectsController } from './rest/projects.controller';
import { ConsumersController } from './rest/consumers.controller';
import { SubscriptionsController } from './rest/subscriptions.controller';
import { EventsController } from './rest/events.controller';
import { DeliveryLogsController } from './rest/delivery-logs.controller';
import { ConnectionsController } from './rest/connections.controller';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { AuthModule } from '@application/auth/auth.module';
import { ProjectsModule } from '@application/projects/projects.module';
import { ConsumersModule } from '@application/consumers/consumers.module';
import { EventsModule } from '@application/events/events.module';
import { DeliveryModule } from '@application/delivery/delivery.module';
import { SocketIoModule } from '@infrastructure/transport/socketio/socketio.module';

@Module({
  imports: [
    AuthModule,
    ProjectsModule,
    ConsumersModule,
    EventsModule,
    DeliveryModule,
    SocketIoModule,
  ],
  controllers: [
    AuthController,
    ProjectsController,
    ConsumersController,
    SubscriptionsController,
    EventsController,
    DeliveryLogsController,
    ConnectionsController,
  ],
  providers: [JwtAuthGuard],
  exports: [JwtAuthGuard],
})
export class ApiModule {}
