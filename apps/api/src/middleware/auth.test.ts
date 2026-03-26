import { Hono } from 'hono';
import { describe, expect, it } from 'vitest';
import { auth } from './auth';

describe('auth middleware', () => {
  it('allows request with valid Bearer token', async () => {
    const env = { AUTH_TOKEN: 'valid-token' };
    const app = new Hono();
    app.use('*', auth(env));
    app.get('/test', context => context.json({ success: true }));

    const response = await app.request('/test', {
      headers: { Authorization: 'Bearer valid-token' },
    });

    expect(response.status).toBe(200);
    const json = await response.json();
    expect(json).toEqual({ success: true });
  });

  it('rejects request with no Authorization header', async () => {
    const env = { AUTH_TOKEN: 'valid-token' };
    const app = new Hono();
    app.use('*', auth(env));
    app.get('/test', context => context.json({ success: true }));

    const response = await app.request('/test');

    expect(response.status).toBe(401);
    const json = await response.json();
    expect(json).toEqual({
      error: { code: 'UNAUTHORIZED', message: 'Invalid or missing token' },
    });
  });

  it('rejects request with wrong token', async () => {
    const env = { AUTH_TOKEN: 'valid-token' };
    const app = new Hono();
    app.use('*', auth(env));
    app.get('/test', context => context.json({ success: true }));

    const response = await app.request('/test', {
      headers: { Authorization: 'Bearer wrong-token' },
    });

    expect(response.status).toBe(401);
    const json = await response.json();
    expect(json).toEqual({
      error: { code: 'UNAUTHORIZED', message: 'Invalid or missing token' },
    });
  });

  it('rejects request with malformed header (Basic scheme)', async () => {
    const env = { AUTH_TOKEN: 'valid-token' };
    const app = new Hono();
    app.use('*', auth(env));
    app.get('/test', context => context.json({ success: true }));

    const response = await app.request('/test', {
      headers: { Authorization: 'Basic credentials' },
    });

    expect(response.status).toBe(401);
    const json = await response.json();
    expect(json).toEqual({
      error: { code: 'UNAUTHORIZED', message: 'Invalid or missing token' },
    });
  });

  it('rejects request with malformed header (no scheme)', async () => {
    const env = { AUTH_TOKEN: 'valid-token' };
    const app = new Hono();
    app.use('*', auth(env));
    app.get('/test', context => context.json({ success: true }));

    const response = await app.request('/test', {
      headers: { Authorization: 'just-a-token' },
    });

    expect(response.status).toBe(401);
    const json = await response.json();
    expect(json).toEqual({
      error: { code: 'UNAUTHORIZED', message: 'Invalid or missing token' },
    });
  });

  it('GET /health without token passes through (auth not applied to /health)', async () => {
    const env = { AUTH_TOKEN: 'valid-token' };
    const app = new Hono();

    // Health endpoint before auth
    app.get('/health', context =>
      context.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
      }),
    );

    // API routes with auth
    app.use('/api/*', auth(env));
    app.get('/api/test', context => context.json({ success: true }));

    // Test health endpoint without auth
    const healthResponse = await app.request('/health');
    expect(healthResponse.status).toBe(200);

    // Test API endpoint without auth (should fail)
    const apiResponse = await app.request('/api/test');
    expect(apiResponse.status).toBe(401);
  });
});
