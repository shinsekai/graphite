import type { DrizzleDB } from '@graphite/db';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import type { Env } from './env';
import type { S3StorageClient } from './lib/s3-client';
import { auth } from './middleware/auth';
import { errorHandler } from './middleware/error-handler';
import { createNotesRoutes } from './routes/notes';
import { createUploadsRoutes } from './routes/uploads';

export interface AppDeps {
  env: Env;
  db: DrizzleDB;
  s3: S3StorageClient;
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
  app.route('/api/uploads', createUploadsRoutes(deps));

  return app;
}
