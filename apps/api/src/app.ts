import { Hono } from 'hono';
import { cors } from 'hono/cors';
import type { Env } from './env';
import { errorHandler } from './middleware/error-handler';
import { auth } from './middleware/auth';

export type Db = unknown;

export interface AppDeps {
	env: Env;
	db: Db;
}

export function createApp(deps: AppDeps): Hono {
	const app = new Hono();

	// Error handler first to catch all errors
	errorHandler(app);

	// CORS middleware
	app.use('*', cors({ origin: deps.env.CORS_ORIGIN }));

	// Health check (no auth)
	app.get('/health', (context) => {
		return context.json({
			status: 'ok',
			timestamp: new Date().toISOString(),
		});
	});

	// Auth middleware for all other routes
	app.use('/api/*', auth(deps.env));

	// API routes will be registered here
	// app.route('/api', createNotesRoutes(deps));

	return app;
}
