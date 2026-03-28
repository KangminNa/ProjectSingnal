import { registerAs } from '@nestjs/config';

export default registerAs('database', () => ({
  url: process.env.DATABASE_URL || 'postgresql://relayhub:relayhub_dev@localhost:5432/relayhub',
}));
