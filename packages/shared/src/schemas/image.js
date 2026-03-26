import { z } from 'zod';
/**
 * Schema for image upload response.
 */
export const imageUploadResponseSchema = z.object({
  id: z.string().uuid(),
  url: z.string().url(),
});
//# sourceMappingURL=image.js.map
