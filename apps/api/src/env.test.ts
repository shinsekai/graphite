import { afterEach, describe, expect, it } from 'vitest';
import { envSchema, getEnv, validateEnv } from './env';

describe('env', () => {
  afterEach(() => {
    // Clear cached env after each test
    process.env.DATABASE_URL = undefined;
    process.env.CORS_ORIGIN = undefined;
    process.env.PORT = undefined;
    process.env.AUTH_TOKEN = undefined;
  });

  it('validates a complete env object', () => {
    const rawEnv = {
      DATABASE_URL: 'postgresql://localhost:5432/test',
      CORS_ORIGIN: 'https://example.com',
      PORT: '3001',
      AUTH_TOKEN: 'test-token',
    };

    const result = validateEnv(rawEnv);

    expect(result).toEqual(rawEnv);
  });

  it('defaults PORT to "3000" when omitted', () => {
    const rawEnv = {
      DATABASE_URL: 'postgresql://localhost:5432/test',
      CORS_ORIGIN: 'https://example.com',
      AUTH_TOKEN: 'test-token',
    };

    const result = validateEnv(rawEnv);

    expect(result.PORT).toBe('3000');
  });

  it('fails validation when DATABASE_URL is missing', () => {
    const rawEnv = {
      CORS_ORIGIN: 'https://example.com',
      AUTH_TOKEN: 'test-token',
    };

    const validate = () => validateEnv(rawEnv);

    expect(validate).toThrow();
  });

  it('fails validation when DATABASE_URL is not a valid URL', () => {
    const rawEnv = {
      DATABASE_URL: 'not-a-url',
      CORS_ORIGIN: 'https://example.com',
      AUTH_TOKEN: 'test-token',
    };

    const validate = () => validateEnv(rawEnv);

    expect(validate).toThrow();
  });

  it('fails validation when AUTH_TOKEN is empty', () => {
    const rawEnv = {
      DATABASE_URL: 'postgresql://localhost:5432/test',
      CORS_ORIGIN: 'https://example.com',
      AUTH_TOKEN: '',
    };

    const validate = () => validateEnv(rawEnv);

    expect(validate).toThrow();
  });

  it('exposes envSchema for testing', () => {
    expect(envSchema).toBeDefined();
  });

  it('getEnv reads from process.env', () => {
    process.env.DATABASE_URL = 'postgresql://localhost:5432/test';
    process.env.CORS_ORIGIN = 'https://example.com';
    process.env.AUTH_TOKEN = 'test-token';

    // Note: This test will fail validation if env is invalid
    // and exit the process with code 1, which is expected behavior
    // We can't easily test the exit path, so we just verify
    // that getEnv returns a valid env when all vars are present

    const env = getEnv();

    expect(env.DATABASE_URL).toBe('postgresql://localhost:5432/test');
    expect(env.AUTH_TOKEN).toBe('test-token');
  });
});
