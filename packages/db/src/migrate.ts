import { migrate } from 'drizzle-orm/postgres-js/migrator';
import { createDb } from './client.js';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const migrationsFolder = resolve(__dirname, '../drizzle');

/**
 * Run database migrations.
 *
 * This function applies any pending migrations from the configured
 * migrations folder to the database.
 *
 * @param connectionString - PostgreSQL connection string
 * @throws Error if migration fails
 */
export async function runMigrations(connectionString: string): Promise<void> {
  const db = createDb(connectionString);
  await migrate(db, { migrationsFolder });
}
