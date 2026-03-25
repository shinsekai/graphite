import { describe, expect, it } from 'vitest';
import { placeholder } from './index';

describe('@graphite/shared', () => {
  it('exports a placeholder', () => {
    expect(placeholder).toBe('Shared package placeholder');
  });

  it('performs a basic arithmetic check', () => {
    expect(1 + 1).toBe(2);
  });
});
