import { describe, it, expect, beforeEach, vi } from 'vitest';
import { formatDate, formatFullDate } from './format-date';

describe('formatDate', () => {
  beforeEach(() => {
    vi.setSystemTime(new Date('2026-03-26T12:00:00.000Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should format seconds ago', () => {
    const now = Date.now();
    expect(formatDate(new Date(now - 15000).toISOString())).toBe('15s');
    expect(formatDate(new Date(now - 59000).toISOString())).toBe('59s');
  });

  it('should format minutes ago', () => {
    const now = Date.now();
    expect(formatDate(new Date(now - 1800000).toISOString())).toBe('30m');
    expect(formatDate(new Date(now - 3599000).toISOString())).toBe('59m');
  });

  it('should format hours ago', () => {
    const now = Date.now();
    expect(formatDate(new Date(now - 14400000).toISOString())).toBe('4h');
    expect(formatDate(new Date(now - 43200000).toISOString())).toBe('12h');
  });

  it('should format days ago', () => {
    const now = Date.now();
    expect(formatDate(new Date(now - 172800000).toISOString())).toBe('2d');
    expect(formatDate(new Date(now - 518400000).toISOString())).toBe('6d');
  });

  it('should format weeks ago', () => {
    const now = Date.now();
    expect(formatDate(new Date(now - 604800000).toISOString())).toBe('1w');
    expect(formatDate(new Date(now - 1814400000).toISOString())).toBe('3w');
  });

  it('should format months ago', () => {
    const now = Date.now();
    expect(formatDate(new Date(now - 2592000000).toISOString())).toBe('1mo');
    expect(formatDate(new Date(now - 5184000000).toISOString())).toBe('2mo');
  });

  it('should format years ago', () => {
    const now = Date.now();
    expect(formatDate(new Date(now - 31536000000).toISOString())).toBe('1y');
  });

  it('should handle edge cases', () => {
    const now = Date.now();
    expect(formatDate(new Date(now).toISOString())).toBe('0s');
    expect(formatDate(new Date(now - 999).toISOString())).toBe('0s');
  });
});

describe('formatFullDate', () => {
  it('should format full date with time', () => {
    const result = formatFullDate('2026-03-26T14:30:00.000Z');
    expect(result).toMatch(/Mar 26, 2026/);
    expect(result).toMatch(/\d{1,2}:\d{2} (AM|PM)/);
  });
});
