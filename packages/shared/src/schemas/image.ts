import { z } from 'zod';

/**
 * Schema for image upload response.
 */
export const imageUploadResponseSchema = z.object({
  id: z.string().uuid(),
  url: z.string().url(),
});

/**
 * Inferred TypeScript types.
 */
export type ImageUploadResponse = z.infer<typeof imageUploadResponseSchema>;
