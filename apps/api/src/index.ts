import { createDb, runMigrations } from '@graphite/db';
import { createApp } from './app';
import { getEnv } from './env';

async function main() {
  const env = getEnv();

  // Run migrations before starting the server (critical for Scaleway)
  try {
    await runMigrations(env.DATABASE_URL);
  } catch (error) {
    console.error('Failed to run migrations:', error);
    process.exit(1);
  }

  // Create DB connection after migrations
  const db = createDb(env.DATABASE_URL);
  const app = createApp({ env, db });

  const _server = Bun.serve({
    fetch: app.fetch,
    port: Number.parseInt(env.PORT, 10),
    hostname: '0.0.0.0',
  });
}

main().catch(error => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
