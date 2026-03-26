import { createDb } from '@graphite/db';
import { createApp } from './app';
import { getEnv } from './env';

async function main() {
  const env = getEnv();

  // Verify DB connection before starting the server
  try {
    const db = createDb(env.DATABASE_URL);
    await db.execute('SELECT 1');
  } catch (error) {
    console.error('Failed to connect to database:', error);
    process.exit(1);
  }

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
