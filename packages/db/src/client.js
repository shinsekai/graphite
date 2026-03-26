import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema/index.js';
export function createDb(connectionString) {
  const queryClient = postgres(connectionString);
  return drizzle(queryClient, { schema });
}
//# sourceMappingURL=client.js.map
