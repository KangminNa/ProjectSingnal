import { Module } from '@nestjs/common';
import { AppConfigModule } from '@config/config.module';
import { InfrastructureModule } from '@infrastructure/infrastructure.module';
import { AuthModule } from '@modules/auth/auth.module';
import { ProjectsModule } from '@modules/projects/projects.module';
import { ConsumersModule } from '@modules/consumers/consumers.module';
import { EventsModule } from '@modules/events/events.module';
import { DeliveryModule } from '@modules/delivery/delivery.module';

@Module({
  imports: [
    AppConfigModule,
    InfrastructureModule,
    AuthModule,
    ProjectsModule,
    ConsumersModule,
    EventsModule,
    DeliveryModule,
  ],
})
export class AppModule {}
