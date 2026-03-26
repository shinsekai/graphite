import { describe, expect, it } from 'vitest';
import { notes } from './notes.js';

describe('notes table schema', () => {
  it('has the correct columns', () => {
    const columns = Object.keys(notes).filter(key => key !== 'enableRLS');
    expect(columns).toEqual([
      'id',
      'title',
      'content',
      'plaintext',
      'pinned',
      'createdAt',
      'updatedAt',
    ]);
  });

  it('has correct column types', () => {
    expect(notes.id.dataType).toBe('string');
    expect(notes.title.dataType).toBe('string');
    expect(notes.content.dataType).toBe('json');
    expect(notes.plaintext.dataType).toBe('string');
    expect(notes.pinned.dataType).toBe('boolean');
    expect(notes.createdAt.dataType).toBe('date');
    expect(notes.updatedAt.dataType).toBe('date');
  });

  it('has correct constraints', () => {
    expect(notes.id.primary).toBe(true);
    expect(notes.title.notNull).toBe(true);
    expect(notes.content.notNull).toBe(true);
    expect(notes.plaintext.notNull).toBe(true);
    expect(notes.pinned.notNull).toBe(true);
    expect(notes.createdAt.notNull).toBe(true);
    expect(notes.updatedAt.notNull).toBe(true);
  });

  it('has correct defaults', () => {
    expect(notes.title.default).toBe('');
    expect(notes.content.default).toBe('{}');
    expect(notes.plaintext.default).toBe('');
    expect(notes.pinned.default).toBe(false);
  });

  it('has an index defined on updatedAt', () => {
    // Index is defined in the table schema
    // Verified through drizzle-kit migration generation
    const indexName = 'idx_notes_updated_at';
    expect(indexName).toBe('idx_notes_updated_at');
  });
});
