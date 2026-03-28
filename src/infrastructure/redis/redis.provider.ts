import { Provider, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

export const REDIS_CLIENT = Symbol('REDIS_CLIENT');

export const RedisProvider: Provider = {
  provide: REDIS_CLIENT,
  inject: [ConfigService],
  useFactory: (configService: ConfigService): Redis => {
    const logger = new Logger('RedisProvider');
    const host = configService.get<string>('redis.host')!;
    const port = configService.get<number>('redis.port')!;

    const client = new Redis({ host, port });

    client.on('connect', () => logger.log(`Connected to Redis at ${host}:${port}`));
    client.on('error', (err) => logger.error('Redis error', err));

    return client;
  },
};
