import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { validateEnv, envSchema, getEnv } from './env';

describe('env', () => {
	afterEach(() => {
		// Clear cached env after each test
		delete process.env.DATABASE_URL;
		delete process.env.S3_ENDPOINT;
		delete process.env.S3_BUCKET;
		delete process.env.S3_ACCESS_KEY;
		delete process.env.S3_SECRET_KEY;
		delete process.env.S3_REGION;
		delete process.env.CORS_ORIGIN;
		delete process.env.PORT;
		delete process.env.AUTH_TOKEN;
	});

	it('validates a complete env object', () => {
		const rawEnv = {
			DATABASE_URL: 'postgresql://localhost:5432/test',
			S3_ENDPOINT: 'https://s3.example.com',
			S3_BUCKET: 'test-bucket',
			S3_ACCESS_KEY: 'access-key',
			S3_SECRET_KEY: 'secret-key',
			S3_REGION: 'us-east-1',
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
			S3_ENDPOINT: 'https://s3.example.com',
			S3_BUCKET: 'test-bucket',
			S3_ACCESS_KEY: 'access-key',
			S3_SECRET_KEY: 'secret-key',
			S3_REGION: 'us-east-1',
			CORS_ORIGIN: 'https://example.com',
			AUTH_TOKEN: 'test-token',
		};

		const result = validateEnv(rawEnv);

		expect(result.PORT).toBe('3000');
	});

	it('fails validation when DATABASE_URL is missing', () => {
		const rawEnv = {
			S3_ENDPOINT: 'https://s3.example.com',
			S3_BUCKET: 'test-bucket',
			S3_ACCESS_KEY: 'access-key',
			S3_SECRET_KEY: 'secret-key',
			S3_REGION: 'us-east-1',
			CORS_ORIGIN: 'https://example.com',
			AUTH_TOKEN: 'test-token',
		};

		const validate = () => validateEnv(rawEnv);

		expect(validate).toThrow();
	});

	it('fails validation when DATABASE_URL is not a valid URL', () => {
		const rawEnv = {
			DATABASE_URL: 'not-a-url',
			S3_ENDPOINT: 'https://s3.example.com',
			S3_BUCKET: 'test-bucket',
			S3_ACCESS_KEY: 'access-key',
			S3_SECRET_KEY: 'secret-key',
			S3_REGION: 'us-east-1',
			CORS_ORIGIN: 'https://example.com',
			AUTH_TOKEN: 'test-token',
		};

		const validate = () => validateEnv(rawEnv);

		expect(validate).toThrow();
	});

	it('fails validation when AUTH_TOKEN is empty', () => {
		const rawEnv = {
			DATABASE_URL: 'postgresql://localhost:5432/test',
			S3_ENDPOINT: 'https://s3.example.com',
			S3_BUCKET: 'test-bucket',
			S3_ACCESS_KEY: 'access-key',
			S3_SECRET_KEY: 'secret-key',
			S3_REGION: 'us-east-1',
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
		process.env.S3_ENDPOINT = 'https://s3.example.com';
		process.env.S3_BUCKET = 'test-bucket';
		process.env.S3_ACCESS_KEY = 'access-key';
		process.env.S3_SECRET_KEY = 'secret-key';
		process.env.S3_REGION = 'us-east-1';
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
