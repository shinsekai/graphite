import { integer, pgTable, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';
import { notes } from './notes.js';

export const images = pgTable('images', {
  id: uuid('id').primaryKey().defaultRandom(),
  noteId: uuid('note_id').references(() => notes.id, { onDelete: 'set null' }),
  s3Key: varchar('s3_key', { length: 1024 }).notNull().unique(),
  filename: varchar('filename', { length: 255 }).notNull(),
  mimeType: varchar('mime_type', { length: 100 }).notNull(),
  sizeBytes: integer('size_bytes').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export type Image = typeof images.$inferSelect;
export type NewImage = typeof images.$inferInsert;
