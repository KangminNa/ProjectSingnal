import { pgTable, uuid, varchar, timestamp, pgEnum } from 'drizzle-orm/pg-core';
import { projects } from './projects.schema';
import { consumers } from './consumers.schema';

export const wsSessionStatusEnum = pgEnum('ws_session_status', [
  'connected',
  'disconnected',
]);

export const websocketSessions = pgTable('websocket_sessions', {
  id: uuid('id').defaultRandom().primaryKey(),
  projectId: uuid('project_id')
    .notNull()
    .references(() => projects.id),
  consumerId: uuid('consumer_id')
    .notNull()
    .references(() => consumers.id),
  socketId: varchar('socket_id', { length: 255 }).notNull(),
  connectedAt: timestamp('connected_at').defaultNow().notNull(),
  lastSeenAt: timestamp('last_seen_at').defaultNow().notNull(),
  status: wsSessionStatusEnum('status').default('connected').notNull(),
});
