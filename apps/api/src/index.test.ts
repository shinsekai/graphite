import { describe, expect, it } from 'vitest';
import { createApp } from './index';

describe('@graphite/api', () => {
  it('responds to GET / with correct message', async () => {
    const app = createApp();
    const response = await app.request('/');
    expect(response.status).toBe(200);
    const json = await response.json();
    expect(json).toEqual({ message: 'Graphite API' });
  });

  it('responds to GET /health with health status', async () => {
    const app = createApp();
    const response = await app.request('/health');
    expect(response.status).toBe(200);
    const json = await response.json();
    expect(json).toHaveProperty('status');
    expect(json).toHaveProperty('timestamp');
    expect(json).toHaveProperty('checks');
  });

  it('performs a basic arithmetic check', () => {
    expect(1 + 1).toBe(2);
  });
});
