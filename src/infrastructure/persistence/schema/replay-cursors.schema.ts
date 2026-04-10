import { pgTable, uuid, varchar, timestamp } from 'drizzle-orm/pg-core';
import { projects } from './projects.schema';
import { consumers } from './consumers.schema';

export const replayCursors = pgTable('replay_cursors', {
  id: uuid('id').defaultRandom().primaryKey(),
  projectId: uuid('project_id')
    .notNull()
    .references(() => projects.id),
  consumerId: uuid('consumer_id')
    .notNull()
    .references(() => consumers.id),
  subject: varchar('subject', { length: 500 }).notNull(),
  lastEventId: varchar('last_event_id', { length: 255 }).notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
