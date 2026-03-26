import { z } from 'zod';
/**
 * Generic API success response wrapper.
 */
export declare const apiSuccessSchema: <T extends z.ZodTypeAny>(dataSchema: T) => z.ZodObject<{
    data: T;
}, z.core.$strip>;
/**
 * API error response schema.
 */
export declare const apiErrorSchema: z.ZodObject<{
    error: z.ZodObject<{
        code: z.ZodString;
        message: z.ZodString;
    }, z.core.$strip>;
}, z.core.$strip>;
/**
 * Schema for search queries.
 */
export declare const searchQuerySchema: z.ZodObject<{
    q: z.ZodString;
}, z.core.$strip>;
/**
 * Inferred TypeScript types.
 */
export type ApiSuccess<T> = {
    data: T;
};
export type ApiError = z.infer<typeof apiErrorSchema>;
export type SearchQuery = z.infer<typeof searchQuerySchema>;
//# sourceMappingURL=common.d.ts.map