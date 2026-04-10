import { pgTable, uuid, varchar, timestamp, jsonb, pgEnum } from 'drizzle-orm/pg-core';
import { projects } from './projects.schema';

export const consumerTypeEnum = pgEnum('consumer_type', [
  'WEBSOCKET',
  'WEBHOOK',
  'PUSH',
  'EMAIL',
]);
export const consumerStatusEnum = pgEnum('consumer_status', ['active', 'inactive']);

export const consumers = pgTable('consumers', {
  id: uuid('id').defaultRandom().primaryKey(),
  projectId: uuid('project_id')
    .notNull()
    .references(() => projects.id),
  name: varchar('name', { length: 255 }).notNull(),
  consumerType: consumerTypeEnum('consumer_type').notNull(),
  endpoint: varchar('endpoint', { length: 2048 }),
  authConfigJson: jsonb('auth_config_json'),
  status: consumerStatusEnum('status').default('active').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
