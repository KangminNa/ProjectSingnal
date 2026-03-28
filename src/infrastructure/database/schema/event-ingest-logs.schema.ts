import { pgTable, uuid, varchar, timestamp, pgEnum } from 'drizzle-orm/pg-core';
import { projects } from './projects.schema';

export const ingestStatusEnum = pgEnum('ingest_status', ['pending', 'relayed', 'failed']);

export const eventIngestLogs = pgTable('event_ingest_logs', {
  id: uuid('id').defaultRandom().primaryKey(),
  projectId: uuid('project_id')
    .notNull()
    .references(() => projects.id),
  eventId: varchar('event_id', { length: 255 }).notNull(),
  eventType: varchar('event_type', { length: 255 }).notNull(),
  producer: varchar('producer', { length: 255 }).notNull(),
  idempotencyKey: varchar('idempotency_key', { length: 255 }),
  status: ingestStatusEnum('status').default('pending').notNull(),
  acceptedAt: timestamp('accepted_at').defaultNow().notNull(),
});
