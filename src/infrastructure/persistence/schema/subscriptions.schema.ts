import { pgTable, uuid, varchar, timestamp, jsonb, pgEnum } from 'drizzle-orm/pg-core';
import { projects } from './projects.schema';
import { consumers } from './consumers.schema';

export const subscriptionStatusEnum = pgEnum('subscription_status', ['active', 'inactive']);

export const subscriptions = pgTable('subscriptions', {
  id: uuid('id').defaultRandom().primaryKey(),
  projectId: uuid('project_id')
    .notNull()
    .references(() => projects.id),
  consumerId: uuid('consumer_id')
    .notNull()
    .references(() => consumers.id),
  eventPattern: varchar('event_pattern', { length: 500 }).notNull(),
  routingFilterJson: jsonb('routing_filter_json'),
  policyId: uuid('policy_id'),
  status: subscriptionStatusEnum('status').default('active').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
