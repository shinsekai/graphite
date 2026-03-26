import {
  pgTable,
  uuid,
  varchar,
  jsonb,
  text,
  boolean,
  timestamp,
  index,
} from 'drizzle-orm/pg-core';
export const notes = pgTable(
  'notes',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    title: varchar('title', { length: 500 }).notNull().default(''),
    content: jsonb('content').notNull().default('{}'),
    plaintext: text('plaintext').notNull().default(''),
    pinned: boolean('pinned').notNull().default(false),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  table => ({
    updatedAtIdx: index('idx_notes_updated_at').on(table.updatedAt),
  }),
);
//# sourceMappingURL=notes.js.map
