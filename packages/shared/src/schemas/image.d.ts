import { z } from 'zod';
/**
 * Schema for image upload response.
 */
export declare const imageUploadResponseSchema: z.ZodObject<{
    id: z.ZodString;
    url: z.ZodString;
}, z.core.$strip>;
/**
 * Inferred TypeScript types.
 */
export type ImageUploadResponse = z.infer<typeof imageUploadResponseSchema>;
//# sourceMappingURL=image.d.ts.map