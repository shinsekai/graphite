import { z } from 'zod';

/**
 * Schema for the upload response.
 */
export const uploadResponseSchema = z.object({
  id: z.string().uuid(),
  url: z.string().url(),
});

/**
 * Inferred TypeScript type.
 */
export type UploadResponse = z.infer<typeof uploadResponseSchema>;
