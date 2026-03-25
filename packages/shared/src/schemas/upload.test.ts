import { describe, expect, it } from 'vitest';
import { type UploadResponse, uploadResponseSchema } from './upload';

describe('uploadResponseSchema', () => {
  const validResponse = {
    id: '550e8400-e29b-41d4-a716-446655440000',
    url: 'https://example.com/image.jpg',
  };

  it('parses valid upload response data', () => {
    const result = uploadResponseSchema.parse(validResponse);
    expect(result).toEqual(validResponse);
  });

  it('fails with invalid UUID format', () => {
    const invalidResponse = { ...validResponse, id: 'not-a-uuid' };
    expect(() => uploadResponseSchema.parse(invalidResponse)).toThrow();
  });

  it('fails with invalid URL format', () => {
    const invalidResponse = { ...validResponse, url: 'not-a-url' };
    expect(() => uploadResponseSchema.parse(invalidResponse)).toThrow();
  });

  it('fails with missing required fields', () => {
    const partialResponse = { id: validResponse.id };
    expect(() => uploadResponseSchema.parse(partialResponse)).toThrow();
  });

  it('fails with empty object', () => {
    expect(() => uploadResponseSchema.parse({})).toThrow();
  });

  it('strips extra fields', () => {
    const responseWithExtra = { ...validResponse, extra: 'ignored' };
    const result = uploadResponseSchema.parse(responseWithExtra);
    expect(result).not.toHaveProperty('extra');
  });

  it('rejects null values', () => {
    const nullIdResponse = { ...validResponse, id: null as unknown as string };
    expect(() => uploadResponseSchema.parse(nullIdResponse)).toThrow();
  });

  it('accepts various valid URL formats', () => {
    const urlVariants = [
      'https://s3.fr-par.scw.cloud/bucket/image.png',
      'https://example.com:443/image.jpg',
      'https://cdn.example.com/images/123/image.webp',
    ];
    for (const url of urlVariants) {
      const result = uploadResponseSchema.parse({ ...validResponse, url });
      expect(result.url).toBe(url);
    }
  });

  it('infers UploadResponse type correctly', () => {
    const response: UploadResponse = validResponse;
    expect(response.id).toBe(validResponse.id);
    expect(response.url).toBe(validResponse.url);
  });
});
