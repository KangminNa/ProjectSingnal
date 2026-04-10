import { Module } from '@nestjs/common';
import { AppConfigModule } from '@config/config.module';
import { InfrastructureModule } from '@infrastructure/infrastructure.module';
import { ApiModule } from '@api/api.module';

@Module({
  imports: [
    AppConfigModule,
    InfrastructureModule,
    ApiModule,
  ],
})
export class AppModule {}
