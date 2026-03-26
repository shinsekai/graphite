import { z } from 'zod';
/**
 * The full Note schema with all fields.
 */
export declare const noteSchema: z.ZodObject<{
    id: z.ZodString;
    title: z.ZodString;
    content: z.ZodJSONSchema;
    plaintext: z.ZodString;
    pinned: z.ZodBoolean;
    createdAt: z.ZodString;
    updatedAt: z.ZodString;
}, z.core.$strip>;
/**
 * Schema for creating a new note.
 * Both title and content are optional; defaults are handled server-side.
 */
export declare const createNoteSchema: z.ZodObject<{
    title: z.ZodOptional<z.ZodString>;
    content: z.ZodOptional<z.ZodJSONSchema>;
}, z.core.$strip>;
/**
 * Schema for updating an existing note.
 * All fields are optional; only provided fields are updated.
 */
export declare const updateNoteSchema: z.ZodObject<{
    title: z.ZodOptional<z.ZodString>;
    content: z.ZodOptional<z.ZodJSONSchema>;
    plaintext: z.ZodOptional<z.ZodString>;
    pinned: z.ZodOptional<z.ZodBoolean>;
}, z.core.$strip>;
/**
 * Summary view of a note (for list views).
 * Includes a preview of the content.
 */
export declare const noteSummarySchema: z.ZodObject<{
    id: z.ZodString;
    title: z.ZodString;
    preview: z.ZodString;
    pinned: z.ZodBoolean;
    updatedAt: z.ZodString;
}, z.core.$strip>;
/**
 * Inferred TypeScript types.
 */
export type Note = z.infer<typeof noteSchema>;
export type CreateNote = z.infer<typeof createNoteSchema>;
export type UpdateNote = z.infer<typeof updateNoteSchema>;
export type NoteSummary = z.infer<typeof noteSummarySchema>;
//# sourceMappingURL=note.d.ts.map