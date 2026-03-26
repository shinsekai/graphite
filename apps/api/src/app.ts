import type { DrizzleDB } from '@graphite/db';
import { Hono } from 'hono';
import { serveStatic } from 'hono/bun';
import { cors } from 'hono/cors';
import type { Env } from './env';
import { auth } from './middleware/auth';
import { errorHandler } from './middleware/error-handler';
import { createNotesRoutes } from './routes/notes';

export interface AppDeps {
  env: Env;
  db: DrizzleDB;
}

export function createApp(deps: AppDeps): Hono {
  const app = new Hono();

  // Error handler first to catch all errors
  errorHandler(app);

  // CORS middleware
  app.use('*', cors({ origin: deps.env.CORS_ORIGIN }));

  // Health check (no auth)
  app.get('/health', context => {
    return context.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
    });
  });

  // Auth middleware for all other routes
  app.use('/api/*', auth(deps.env));

  // API routes
  app.route('/api/notes', createNotesRoutes(deps));

  // Static file serving - only serve Vite's hashed assets
  app.use('/assets/*', serveStatic({ root: './apps/web/dist' }));

  // Serve other root-level static files (favicon.ico, manifest, etc.)
  app.use('/favicon.ico', serveStatic({ path: './apps/web/dist/favicon.ico' }));

  // SPA fallback - serve index.html for all non-API, non-health, non-asset GET requests
  app.get('*', async (context) => {
    const indexPath = './apps/web/dist/index.html';
    const file = Bun.file(indexPath);
    if (await file.exists()) {
      return context.html(await file.text());
    }
    return context.text('index.html not found', 404);
  });

  return app;
}
