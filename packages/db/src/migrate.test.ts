import { beforeEach, describe, expect, it, vi } from 'vitest';
import { runMigrations } from './migrate.js';

vi.mock('drizzle-orm/postgres-js/migrator', () => ({
  migrate: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('./client.js', () => ({
  createDb: vi.fn().mockReturnValue({}),
}));

describe('migrate', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('exports runMigrations as a function', () => {
    expect(runMigrations).toBeTypeOf('function');
  });

  it('accepts a connection string parameter', () => {
    expect(runMigrations).toHaveLength(1);
  });

  it('returns a Promise', async () => {
    await expect(runMigrations('postgresql://localhost/test')).resolves.toBeUndefined();
  });
});
