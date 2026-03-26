import { createDb } from '@graphite/db';
import { createApp } from './app';
import { getEnv } from './env';
import { createS3Client } from './lib/s3-client';

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
  const s3 = createS3Client({
    endpoint: env.S3_ENDPOINT,
    bucket: env.S3_BUCKET,
    accessKey: env.S3_ACCESS_KEY,
    secretKey: env.S3_SECRET_KEY,
    region: env.S3_REGION,
  });

  const app = createApp({ env, db, s3 });

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
