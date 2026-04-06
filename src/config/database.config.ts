import { registerAs } from '@nestjs/config';

export default registerAs('database', () => ({
  url: process.env.DATABASE_URL || 'postgresql://projectsignal:projectsignal_dev@localhost:5432/projectsignal',
}));
