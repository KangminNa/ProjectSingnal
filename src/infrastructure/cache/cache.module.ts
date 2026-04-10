import { Global, Module } from '@nestjs/common';
import { RedisProvider } from './redis.provider';
import { RedisPresenceAdapter } from './redis-presence.adapter';
import { PRESENCE_STORE } from '@core/injection-tokens';

@Global()
@Module({
  providers: [
    RedisProvider,
    {
      provide: PRESENCE_STORE,
      useClass: RedisPresenceAdapter,
    },
    RedisPresenceAdapter,
  ],
  exports: [PRESENCE_STORE, RedisProvider],
})
export class CacheModule {}
