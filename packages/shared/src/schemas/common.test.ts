import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import {
  type ApiError,
  type ApiSuccess,
  type SearchQuery,
  apiErrorSchema,
  apiSuccessSchema,
  searchQuerySchema,
} from './common';

describe('apiSuccessSchema', () => {
  const noteSchema = z.object({
    id: z.string().uuid(),
    title: z.string(),
  });
  const successSchema = apiSuccessSchema(noteSchema);

  it('parses valid success response', () => {
    const input = {
      data: { id: '550e8400-e29b-41d4-a716-446655440000', title: 'Test' },
    };
    const result = successSchema.parse(input);
    expect(result).toEqual(input);
  });

  it('fails with missing data field', () => {
    expect(() => successSchema.parse({})).toThrow();
  });

  it('fails when data does not match provided schema', () => {
    expect(() => successSchema.parse({ data: { id: 'invalid-uuid', title: 'Test' } })).toThrow();
  });

  it('strips extra fields', () => {
    const input = {
      data: { id: '550e8400-e29b-41d4-a716-446655440000', title: 'Test' },
      extra: 'ignored',
    };
    const result = successSchema.parse(input);
    expect(result).not.toHaveProperty('extra');
  });

  it('rejects null values', () => {
    expect(() => successSchema.parse({ data: null as never })).toThrow();
  });

  it('works with array data', () => {
    const arraySchema = apiSuccessSchema(z.array(noteSchema));
    const input = {
      data: [{ id: '550e8400-e29b-41d4-a716-446655440000', title: 'Test' }],
    };
    const result = arraySchema.parse(input);
    expect(result.data).toHaveLength(1);
  });

  it('infers ApiSuccess type correctly', () => {
    const response: ApiSuccess<{ id: string }> = {
      data: { id: '123' },
    };
    expect(response.data.id).toBe('123');
  });
});

describe('apiErrorSchema', () => {
  const validError = {
    error: { code: 'VALIDATION_ERROR', message: 'Invalid input' },
  };

  it('parses valid error response', () => {
    const result = apiErrorSchema.parse(validError);
    expect(result).toEqual(validError);
  });

  it('fails with missing error field', () => {
    expect(() => apiErrorSchema.parse({})).toThrow();
  });

  it('fails with missing code', () => {
    const invalidError = { error: { message: 'Error' } };
    expect(() => apiErrorSchema.parse(invalidError)).toThrow();
  });

  it('fails with missing message', () => {
    const invalidError = { error: { code: 'ERROR_CODE' } };
    expect(() => apiErrorSchema.parse(invalidError)).toThrow();
  });

  it('fails with extra fields in error object', () => {
    const invalidError = {
      error: { code: 'ERROR', message: 'Error', extra: 'ignored' },
    };
    const result = apiErrorSchema.parse(invalidError);
    expect(result.error).not.toHaveProperty('extra');
  });

  it('rejects null values', () => {
    const invalidError = {
      error: { code: null as never, message: 'Error' },
    };
    expect(() => apiErrorSchema.parse(invalidError)).toThrow();
  });

  it('accepts various error codes', () => {
    const codes = ['VALIDATION_ERROR', 'NOT_FOUND', 'INTERNAL_ERROR', 'UNAUTHORIZED', 'FORBIDDEN'];
    for (const code of codes) {
      const result = apiErrorSchema.parse({
        error: { code, message: 'Error message' },
      });
      expect(result.error.code).toBe(code);
    }
  });

  it('infers ApiError type correctly', () => {
    const response: ApiError = {
      error: { code: 'ERROR', message: 'Message' },
    };
    expect(response.error.code).toBe('ERROR');
  });
});

describe('searchQuerySchema', () => {
  it('parses valid search query', () => {
    const input = { q: 'test search' };
    const result = searchQuerySchema.parse(input);
    expect(result).toEqual(input);
  });

  it('parses single character query', () => {
    const input = { q: 'a' };
    const result = searchQuerySchema.parse(input);
    expect(result.q).toBe('a');
  });

  it('parses maximum length query (200 chars)', () => {
    const longQuery = 'x'.repeat(200);
    const input = { q: longQuery };
    const result = searchQuerySchema.parse(input);
    expect(result.q).toHaveLength(200);
  });

  it('fails with empty string', () => {
    expect(() => searchQuerySchema.parse({ q: '' })).toThrow();
  });

  it('fails with whitespace only', () => {
    expect(() => searchQuerySchema.parse({ q: '   ' })).toThrow();
  });

  it('fails when exceeding max length', () => {
    const tooLongQuery = 'x'.repeat(201);
    expect(() => searchQuerySchema.parse({ q: tooLongQuery })).toThrow();
  });

  it('fails with missing q field', () => {
    expect(() => searchQuerySchema.parse({})).toThrow();
  });

  it('strips extra fields', () => {
    const input = { q: 'search', extra: 'ignored' };
    const result = searchQuerySchema.parse(input);
    expect(result).not.toHaveProperty('extra');
  });

  it('accepts special characters in query', () => {
    const specialChars = 'hello @world! #tag $100 %';
    const result = searchQuerySchema.parse({ q: specialChars });
    expect(result.q).toBe(specialChars);
  });

  it('accepts unicode characters', () => {
    const unicode = 'hello 世界 🌍 café';
    const result = searchQuerySchema.parse({ q: unicode });
    expect(result.q).toBe(unicode);
  });

  it('infers SearchQuery type correctly', () => {
    const query: SearchQuery = { q: 'search' };
    expect(query.q).toBe('search');
  });
});
