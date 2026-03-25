import { Hono } from 'hono';

const app = new Hono();

app.get('/', context => {
  return context.json({ message: 'Graphite API' });
});

app.get('/health', context => {
  return context.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    checks: {
      database: 'not_implemented',
      storage: 'not_implemented',
    },
  });
});

export const createApp = (): Hono => app;
