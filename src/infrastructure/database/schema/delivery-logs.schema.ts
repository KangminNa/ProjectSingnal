import { pgTable, uuid, varchar, timestamp, integer, pgEnum } from 'drizzle-orm/pg-core';
import { projects } from './projects.schema';
import { consumers } from './consumers.schema';

export const deliveryChannelEnum = pgEnum('delivery_channel', [
  'realtime',
  'push',
  'webhook',
  'email',
]);
export const deliveryStatusEnum = pgEnum('delivery_status', [
  'pending',
  'delivered',
  'failed',
  'retrying',
  'dead_lettered',
]);

export const deliveryLogs = pgTable('delivery_logs', {
  id: uuid('id').defaultRandom().primaryKey(),
  projectId: uuid('project_id')
    .notNull()
    .references(() => projects.id),
  eventId: varchar('event_id', { length: 255 }).notNull(),
  consumerId: uuid('consumer_id')
    .notNull()
    .references(() => consumers.id),
  channelType: deliveryChannelEnum('channel_type').notNull(),
  status: deliveryStatusEnum('status').default('pending').notNull(),
  attemptCount: integer('attempt_count').default(0).notNull(),
  deliveredAt: timestamp('delivered_at'),
  lastError: varchar('last_error', { length: 2048 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
