import { Provider, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { connect, NatsConnection } from 'nats';

export const NATS_CONNECTION = Symbol('NATS_CONNECTION');

export const NatsProvider: Provider = {
  provide: NATS_CONNECTION,
  inject: [ConfigService],
  useFactory: async (configService: ConfigService): Promise<NatsConnection> => {
    const logger = new Logger('NatsProvider');
    const url = configService.get<string>('nats.url')!;

    try {
      const nc = await connect({ servers: url });
      logger.log(`Connected to NATS at ${url}`);
      return nc;
    } catch (error) {
      logger.error(`Failed to connect to NATS at ${url}`, error);
      throw error;
    }
  },
};
