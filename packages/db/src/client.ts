import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema/index.js';

export type DrizzleDB = ReturnType<typeof createDb>;

export function createDb(connectionString: string) {
  const queryClient = postgres(connectionString);
  return drizzle(queryClient, { schema });
}
