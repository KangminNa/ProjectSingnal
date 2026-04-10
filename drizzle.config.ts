import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src/infrastructure/persistence/schema/index.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL ?? 'postgresql://projectsignal:projectsignal_dev@localhost:5432/projectsignal',
  },
});
