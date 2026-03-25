import { describe, expect, it, vi } from 'vitest';
import { Hono } from 'hono';
import { createErrorHandler, AppError } from './error-handler';

describe('errorHandler middleware', () => {
	it('catches AppError and returns appropriate status and code', async () => {
		const app = new Hono();
		app.onError(createErrorHandler());
		app.get('/error', () => {
			throw new AppError(400, 'BAD_REQUEST', 'Invalid input');
		});

		const response = await app.request('/error');

		expect(response.status).toBe(400);
		const json = await response.json();
		expect(json).toEqual({
			error: { code: 'BAD_REQUEST', message: 'Invalid input' },
		});
	});

	it('catches generic Error and returns 500 with generic message', async () => {
		const app = new Hono();
		app.onError(createErrorHandler());
		app.get('/error', () => {
			throw new Error('Something went wrong');
		});

		const response = await app.request('/error');

		expect(response.status).toBe(500);
		const json = await response.json();
		expect(json).toEqual({
			error: {
				code: 'INTERNAL_ERROR',
				message: 'An unexpected error occurred',
			},
		});
	});

	it('does not leak stack trace in error response', async () => {
		const app = new Hono();
		app.onError(createErrorHandler());
		app.get('/error', () => {
			const error = new Error('Detailed error');
			error.stack = 'at /some/file.ts:10:5\nat another/file.ts:20:10';
			throw error;
		});

		const response = await app.request('/error');

		expect(response.status).toBe(500);
		const json = await response.json();
		expect(json).toEqual({
			error: {
				code: 'INTERNAL_ERROR',
				message: 'An unexpected error occurred',
			},
		});
	});

	it('allows successful requests to pass through', async () => {
		const app = new Hono();
		app.onError(createErrorHandler());
		app.get('/ok', (context) => context.json({ success: true }));

		const response = await app.request('/ok');

		expect(response.status).toBe(200);
		const json = await response.json();
		expect(json).toEqual({ success: true });
	});

	it('handles 404 routes with generic error', async () => {
		const app = new Hono();
		app.onError(createErrorHandler());
		app.get('/exists', (context) => context.json({ exists: true }));

		const response = await app.request('/not-found');

		// Hono returns 404 for unhandled routes
		expect(response.status).toBe(404);
	});

	it('catches AppError with different status codes', async () => {
		const app = new Hono();
		app.onError(createErrorHandler());

		app.get('/not-found', () => {
			throw new AppError(404, 'NOT_FOUND', 'Resource not found');
		});

		app.get('/forbidden', () => {
			throw new AppError(403, 'FORBIDDEN', 'Access denied');
		});

		const notFoundResponse = await app.request('/not-found');
		expect(notFoundResponse.status).toBe(404);
		const notFoundJson = await notFoundResponse.json();
		expect(notFoundJson.error.code).toBe('NOT_FOUND');

		const forbiddenResponse = await app.request('/forbidden');
		expect(forbiddenResponse.status).toBe(403);
		const forbiddenJson = await forbiddenResponse.json();
		expect(forbiddenJson.error.code).toBe('FORBIDDEN');
	});

	it('logs unhandled errors to console', async () => {
		const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

		const app = new Hono();
		app.onError(createErrorHandler());
		app.get('/error', () => {
			throw new Error('Unhandled error');
		});

		await app.request('/error');

		expect(consoleSpy).toHaveBeenCalledWith('Unhandled error:', expect.any(Error));

		consoleSpy.mockRestore();
	});
});
