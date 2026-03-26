/**
 * Migration Runner
 *
 * Standalone script to run database migrations.
 * Usage: bun run packages/db/src/migrate-runner.ts
 */

import { runMigrations } from './migrate.js';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error('DATABASE_URL environment variable is required');
  process.exit(1);
}

runMigrations(connectionString).catch(error => {
  console.error('Migration failed:', error);
  process.exit(1);
});
