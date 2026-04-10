import { pgTable, uuid, varchar, timestamp, boolean, integer, pgEnum } from 'drizzle-orm/pg-core';
import { projects } from './projects.schema';

export const backoffTypeEnum = pgEnum('backoff_type', ['fixed', 'exponential']);

export const deliveryPolicies = pgTable('delivery_policies', {
  id: uuid('id').defaultRandom().primaryKey(),
  projectId: uuid('project_id')
    .notNull()
    .references(() => projects.id),
  name: varchar('name', { length: 255 }).notNull(),
  realtimeEnabled: boolean('realtime_enabled').default(true).notNull(),
  pushFallbackEnabled: boolean('push_fallback_enabled').default(false).notNull(),
  retryMaxAttempts: integer('retry_max_attempts').default(3).notNull(),
  retryBackoffType: backoffTypeEnum('retry_backoff_type').default('exponential').notNull(),
  retryBackoffValue: integer('retry_backoff_value').default(1000).notNull(),
  ttlSeconds: integer('ttl_seconds').default(86400).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
