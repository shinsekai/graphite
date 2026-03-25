import { describe, expect, it } from 'vitest';
import { placeholder } from './index';

describe('@graphite/db', () => {
  it('exports a placeholder', () => {
    expect(placeholder).toBe('Database package placeholder');
  });

  it('performs a basic arithmetic check', () => {
    expect(1 + 1).toBe(2);
  });
});
