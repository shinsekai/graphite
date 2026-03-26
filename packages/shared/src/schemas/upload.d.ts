import { z } from 'zod';
/**
 * Schema for the upload response.
 */
export declare const uploadResponseSchema: z.ZodObject<{
    id: z.ZodString;
    url: z.ZodString;
}, z.core.$strip>;
/**
 * Inferred TypeScript type.
 */
export type UploadResponse = z.infer<typeof uploadResponseSchema>;
//# sourceMappingURL=upload.d.ts.map