import { getEnv } from './env';
import { createDb } from '@graphite/db';
import { createApp } from './app';

async function main() {
	const env = getEnv();

	// Verify DB connection before starting the server
	try {
		const db = createDb(env.DATABASE_URL);
		await db.execute('SELECT 1');
		console.log('Database connection verified');
	} catch (error) {
		console.error('Failed to connect to database:', error);
		process.exit(1);
	}

	const db = createDb(env.DATABASE_URL);
	const app = createApp({ env, db });

	const server = Bun.serve({
		fetch: app.fetch,
		port: Number.parseInt(env.PORT, 10),
		hostname: '0.0.0.0',
	});

	console.log(`Graphite API listening on port ${server.port}`);
}

main().catch((error) => {
	console.error('Failed to start server:', error);
	process.exit(1);
});
