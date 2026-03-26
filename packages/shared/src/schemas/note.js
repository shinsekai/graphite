import { z } from 'zod';
/**
 * The full Note schema with all fields.
 */
export const noteSchema = z.object({
  id: z.string().uuid(),
  title: z.string().max(500),
  content: z.json(),
  plaintext: z.string(),
  pinned: z.boolean(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});
/**
 * Schema for creating a new note.
 * Both title and content are optional; defaults are handled server-side.
 */
export const createNoteSchema = z.object({
  title: z.string().max(500).optional(),
  content: z.json().optional(),
});
/**
 * Schema for updating an existing note.
 * All fields are optional; only provided fields are updated.
 */
export const updateNoteSchema = z.object({
  title: z.string().max(500).optional(),
  content: z.json().optional(),
  plaintext: z.string().optional(),
  pinned: z.boolean().optional(),
});
/**
 * Summary view of a note (for list views).
 * Includes a preview of the content.
 */
export const noteSummarySchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  preview: z.string().max(80),
  pinned: z.boolean(),
  updatedAt: z.string().datetime(),
});
//# sourceMappingURL=note.js.map
