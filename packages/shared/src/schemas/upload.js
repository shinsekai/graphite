import { z } from 'zod';
/**
 * Schema for the upload response.
 */
export const uploadResponseSchema = z.object({
  id: z.string().uuid(),
  url: z.string().url(),
});
//# sourceMappingURL=upload.js.map
