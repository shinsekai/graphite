import { z } from 'zod';

/**
 * Generic API success response wrapper.
 */
export const apiSuccessSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    data: dataSchema,
  });

/**
 * API error response schema.
 */
export const apiErrorSchema = z.object({
  error: z.object({
    code: z.string(),
    message: z.string(),
  }),
});

/**
 * Schema for search queries.
 */
export const searchQuerySchema = z.object({
  q: z
    .string()
    .min(1)
    .max(200)
    .refine(val => val.trim().length > 0, {
      message: 'Query cannot be whitespace only',
    }),
});

/**
 * Inferred TypeScript types.
 */
export type ApiSuccess<T> = z.infer<ReturnType<typeof apiSuccessSchema<T>>>;
export type ApiError = z.infer<typeof apiErrorSchema>;
export type SearchQuery = z.infer<typeof searchQuerySchema>;
