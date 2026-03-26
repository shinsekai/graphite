import { resolve } from 'node:path';
import type { DrizzleDB } from '@graphite/db';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import type { Env } from './env';
import { auth } from './middleware/auth';
import { errorHandler } from './middleware/error-handler';
import { createNotesRoutes } from './routes/notes';

export interface AppDeps {
  env: Env;
  db: DrizzleDB;
  webDistPath?: string;
}

const MIME_TYPES: Record<string, string> = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.map': 'application/json',
};

function getMimeType(path: string): string {
  const ext = path.slice(path.lastIndexOf('.'));
  return MIME_TYPES[ext] || 'application/octet-stream';
}

export function createApp(deps: AppDeps): Hono {
  const app = new Hono();
  const distPath = resolve(deps.webDistPath || './apps/web/dist');

  // Error handler first
  errorHandler(app);

  // CORS
  app.use('*', cors({ origin: deps.env.CORS_ORIGIN }));

  // Health check (no auth)
  app.get('/health', (c) => {
    return c.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
    });
  });

  // Auth middleware for API routes only
  app.use('/api/*', auth(deps.env));

  // API routes
  app.route('/api/notes', createNotesRoutes(deps));

  // Static file serving using Bun.file directly
  app.get('/assets/*', async (c) => {
    const filePath = resolve(distPath, `.${c.req.path}`);
    const file = Bun.file(filePath);
    if (await file.exists()) {
      return new Response(file, {
        headers: { 'Content-Type': getMimeType(filePath) },
      });
    }
    return c.json({ error: { code: 'NOT_FOUND', message: 'Not found' } }, 404);
  });

  // SPA fallback — serve index.html for all unmatched GET requests
  app.notFound(async (c) => {
    if (c.req.method === 'GET') {
      const indexFile = Bun.file(resolve(distPath, 'index.html'));
      if (await indexFile.exists()) {
        return c.html(await indexFile.text());
      }
    }
    return c.json({ error: { code: 'NOT_FOUND', message: 'Not found' } }, 404);
  });

  return app;
}
