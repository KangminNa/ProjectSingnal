import { Module } from '@nestjs/common';
import { DatabaseModule } from './database/database.module';
import { NatsModule } from './nats/nats.module';
import { RedisModule } from './redis/redis.module';
import { BullMqModule } from './bullmq/bullmq.module';
import { ObservabilityModule } from './observability/observability.module';

@Module({
  imports: [DatabaseModule, NatsModule, RedisModule, BullMqModule, ObservabilityModule],
  exports: [DatabaseModule, NatsModule, RedisModule, BullMqModule],
})
export class InfrastructureModule {}
