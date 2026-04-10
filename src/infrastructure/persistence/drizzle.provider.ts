import { Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { drizzle } from 'drizzle-orm/postgres-js';
import * as postgres from 'postgres';
import { DRIZZLE } from '@core/injection-tokens';
import * as schema from './schema';

export const DrizzleProvider: Provider = {
  provide: DRIZZLE,
  inject: [ConfigService],
  useFactory: (configService: ConfigService) => {
    const databaseUrl = configService.get<string>('database.url')!;
    const client = postgres(databaseUrl);
    return drizzle(client, { schema });
  },
};
