import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { notes } from './api-client';

describe('api-client', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe('notes.list', () => {
    it('returns list of notes', async () => {
      const mockNotes = [
        {
          id: '550e8400-e29b-41d4-a716-446655440000',
          title: 'Test Note',
          preview: 'Test preview',
          pinned: false,
          updatedAt: '2024-01-01T00:00:00Z',
        },
      ];

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: mockNotes }),
      } as Response);

      const result = await notes.list();

      expect(result).toEqual(mockNotes);
    });
  });

  describe('notes.get', () => {
    it('returns a single note', async () => {
      const mockNote = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        title: 'Test Note',
        content: {},
        plaintext: 'Test content',
        pinned: false,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      };

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: mockNote }),
      } as Response);

      const result = await notes.get('550e8400-e29b-41d4-a716-446655440000');

      expect(result).toEqual(mockNote);
    });
  });

  describe('notes.create', () => {
    it('creates a new note', async () => {
      const mockNote = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        title: 'New Note',
        content: {},
        plaintext: '',
        pinned: false,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      };

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: mockNote }),
      } as Response);

      const result = await notes.create({ title: 'New Note' });

      expect(result).toEqual(mockNote);
    });
  });

  describe('notes.update', () => {
    it('updates an existing note', async () => {
      const mockNote = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        title: 'Updated Note',
        content: {},
        plaintext: '',
        pinned: false,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      };

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: mockNote }),
      } as Response);

      const result = await notes.update('550e8400-e29b-41d4-a716-446655440000', {
        title: 'Updated Note',
      });

      expect(result).toEqual(mockNote);
    });
  });

  describe('notes.remove', () => {
    it('deletes a note', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      } as Response);

      await notes.remove('550e8400-e29b-41d4-a716-446655440000');
    });
  });

  describe('notes.search', () => {
    it('searches notes', async () => {
      const mockNotes = [
        {
          id: '550e8400-e29b-41d4-a716-446655440000',
          title: 'Test Note',
          preview: 'Test preview',
          pinned: false,
          updatedAt: '2024-01-01T00:00:00Z',
        },
      ];

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: mockNotes }),
      } as Response);

      const result = await notes.search('test');

      expect(result).toEqual(mockNotes);
    });
  });
});
