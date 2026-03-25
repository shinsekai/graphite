import { describe, expect, it } from 'vitest';
import {
  type CreateNote,
  type Note,
  type NoteSummary,
  type UpdateNote,
  createNoteSchema,
  noteSchema,
  noteSummarySchema,
  updateNoteSchema,
} from './note';

describe('noteSchema', () => {
  const validNote = {
    id: '550e8400-e29b-41d4-a716-446655440000',
    title: 'Test Note',
    content: { type: 'doc', content: [] },
    plaintext: 'Test content',
    pinned: false,
    createdAt: '2026-03-25T10:00:00.000Z',
    updatedAt: '2026-03-25T10:00:00.000Z',
  };

  it('parses valid note data', () => {
    const result = noteSchema.parse(validNote);
    expect(result).toEqual(validNote);
  });

  it('fails with invalid UUID format', () => {
    const invalidNote = { ...validNote, id: 'not-a-uuid' };
    expect(() => noteSchema.parse(invalidNote)).toThrow();
  });

  it('fails when title exceeds max length', () => {
    const longTitle = 'x'.repeat(501);
    const invalidNote = { ...validNote, title: longTitle };
    expect(() => noteSchema.parse(invalidNote)).toThrow();
  });

  it('fails with missing required fields', () => {
    const partialNote = { id: validNote.id };
    expect(() => noteSchema.parse(partialNote)).toThrow();
  });

  it('fails with invalid datetime format', () => {
    const invalidNote = { ...validNote, createdAt: 'not-a-date' };
    expect(() => noteSchema.parse(invalidNote)).toThrow();
  });

  it('strips extra fields', () => {
    const noteWithExtra = { ...validNote, extraField: 'should be removed' };
    const result = noteSchema.parse(noteWithExtra);
    expect(result).not.toHaveProperty('extraField');
  });

  it('accepts empty string title', () => {
    const emptyTitleNote = { ...validNote, title: '' };
    const result = noteSchema.parse(emptyTitleNote);
    expect(result.title).toBe('');
  });

  it('rejects null values', () => {
    const nullTitleNote = { ...validNote, title: null as unknown as string };
    expect(() => noteSchema.parse(nullTitleNote)).toThrow();
  });

  it('infers Note type correctly', () => {
    const note: Note = validNote;
    expect(note.id).toBe(validNote.id);
  });
});

describe('createNoteSchema', () => {
  it('parses valid data with both fields', () => {
    const input = {
      title: 'New Note',
      content: { type: 'doc', content: [] },
    };
    const result = createNoteSchema.parse(input);
    expect(result).toEqual(input);
  });

  it('parses valid data with only title', () => {
    const input = { title: 'New Note' };
    const result = createNoteSchema.parse(input);
    expect(result.title).toBe('New Note');
  });

  it('parses valid data with only content', () => {
    const input = { content: { type: 'doc', content: [] } };
    const result = createNoteSchema.parse(input);
    expect(result.content).toEqual({ type: 'doc', content: [] });
  });

  it('parses empty object (all optional)', () => {
    const result = createNoteSchema.parse({});
    expect(result).toEqual({});
  });

  it('fails when title exceeds max length', () => {
    const longTitle = 'x'.repeat(501);
    expect(() => createNoteSchema.parse({ title: longTitle })).toThrow();
  });

  it('strips extra fields', () => {
    const input = { title: 'Note', extra: 'ignored' };
    const result = createNoteSchema.parse(input);
    expect(result).not.toHaveProperty('extra');
  });

  it('infers CreateNote type correctly', () => {
    const createNote: CreateNote = { title: 'New Note' };
    expect(createNote.title).toBe('New Note');
  });
});

describe('updateNoteSchema', () => {
  it('parses valid data with single field', () => {
    const input = { title: 'Updated Title' };
    const result = updateNoteSchema.parse(input);
    expect(result).toEqual(input);
  });

  it('parses valid data with multiple fields', () => {
    const input = {
      title: 'Updated',
      content: { type: 'doc', content: [] },
      pinned: true,
    };
    const result = updateNoteSchema.parse(input);
    expect(result).toEqual(input);
  });

  it('parses valid data with all fields', () => {
    const input = {
      title: 'Updated',
      content: { type: 'doc', content: [] },
      plaintext: 'Updated plaintext',
      pinned: true,
    };
    const result = updateNoteSchema.parse(input);
    expect(result).toEqual(input);
  });

  it('parses empty object (all optional)', () => {
    const result = updateNoteSchema.parse({});
    expect(result).toEqual({});
  });

  it('fails when title exceeds max length', () => {
    const longTitle = 'x'.repeat(501);
    expect(() => updateNoteSchema.parse({ title: longTitle })).toThrow();
  });

  it('strips extra fields', () => {
    const input = { title: 'Updated', extra: 'ignored' };
    const result = updateNoteSchema.parse(input);
    expect(result).not.toHaveProperty('extra');
  });

  it('infers UpdateNote type correctly', () => {
    const updateNote: UpdateNote = { pinned: true };
    expect(updateNote.pinned).toBe(true);
  });
});

describe('noteSummarySchema', () => {
  const validSummary = {
    id: '550e8400-e29b-41d4-a716-446655440000',
    title: 'Test Note',
    preview: 'This is a preview...',
    pinned: false,
    updatedAt: '2026-03-25T10:00:00.000Z',
  };

  it('parses valid summary data', () => {
    const result = noteSummarySchema.parse(validSummary);
    expect(result).toEqual(validSummary);
  });

  it('fails with invalid UUID format', () => {
    const invalidSummary = { ...validSummary, id: 'not-a-uuid' };
    expect(() => noteSummarySchema.parse(invalidSummary)).toThrow();
  });

  it('fails when preview exceeds max length', () => {
    const longPreview = 'x'.repeat(81);
    const invalidSummary = { ...validSummary, preview: longPreview };
    expect(() => noteSummarySchema.parse(invalidSummary)).toThrow();
  });

  it('fails with missing required fields', () => {
    const partialSummary = { id: validSummary.id };
    expect(() => noteSummarySchema.parse(partialSummary)).toThrow();
  });

  it('fails with invalid datetime format', () => {
    const invalidSummary = { ...validSummary, updatedAt: 'not-a-date' };
    expect(() => noteSummarySchema.parse(invalidSummary)).toThrow();
  });

  it('strips extra fields', () => {
    const summaryWithExtra = { ...validSummary, extra: 'ignored' };
    const result = noteSummarySchema.parse(summaryWithExtra);
    expect(result).not.toHaveProperty('extra');
  });

  it('accepts empty string preview', () => {
    const emptyPreviewSummary = { ...validSummary, preview: '' };
    const result = noteSummarySchema.parse(emptyPreviewSummary);
    expect(result.preview).toBe('');
  });

  it('infers NoteSummary type correctly', () => {
    const summary: NoteSummary = validSummary;
    expect(summary.id).toBe(validSummary.id);
  });
});
