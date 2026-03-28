import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import appConfig from './app.config';
import databaseConfig from './database.config';
import redisConfig from './redis.config';
import natsConfig from './nats.config';
import bullmqConfig from './bullmq.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, databaseConfig, redisConfig, natsConfig, bullmqConfig],
      envFilePath: '.env',
    }),
  ],
})
export class AppConfigModule {}
