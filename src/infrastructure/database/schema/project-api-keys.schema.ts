import { pgTable, uuid, varchar, timestamp, pgEnum } from 'drizzle-orm/pg-core';
import { projects } from './projects.schema';

export const apiKeyScopeEnum = pgEnum('api_key_scope', ['publish', 'admin', 'read']);
export const apiKeyStatusEnum = pgEnum('api_key_status', ['active', 'revoked']);

export const projectApiKeys = pgTable('project_api_keys', {
  id: uuid('id').defaultRandom().primaryKey(),
  projectId: uuid('project_id')
    .notNull()
    .references(() => projects.id),
  keyHash: varchar('key_hash', { length: 255 }).notNull(),
  scope: apiKeyScopeEnum('scope').notNull(),
  status: apiKeyStatusEnum('status').default('active').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
