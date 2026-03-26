import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useNotes, useNote, useCreateNote, useUpdateNote, useDeleteNote, useSearchNotes } from './use-notes';
import { notes } from '@/lib/api-client';

vi.mock('@/lib/api-client');

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  function TestWrapper({ children }: { readonly children: React.ReactNode }) {
    return React.createElement(QueryClientProvider, { client: queryClient }, children);
  }

  return TestWrapper;
}

describe('use-notes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('useNotes', () => {
    it('fetches notes list', async () => {
      const mockNotes = [
        {
          id: '550e8400-e29b-41d4-a716-446655440000',
          title: 'Test Note',
          preview: 'Test preview',
          pinned: false,
          updatedAt: '2024-01-01T00:00:00Z',
        },
      ];

      vi.mocked(notes.list).mockResolvedValueOnce(mockNotes);

      const { result } = renderHook(() => useNotes(), { wrapper: createWrapper() });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(mockNotes);
      expect(notes.list).toHaveBeenCalledOnce();
    });
  });

  describe('useNote', () => {
    it('fetches a single note', async () => {
      const mockNote = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        title: 'Test Note',
        content: {},
        plaintext: 'Test content',
        pinned: false,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      };

      vi.mocked(notes.get).mockResolvedValueOnce(mockNote);

      const { result } = renderHook(() => useNote('550e8400-e29b-41d4-a716-446655440000'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(mockNote);
      expect(notes.get).toHaveBeenCalledWith('550e8400-e29b-41d4-a716-446655440000');
    });

    it('does not fetch when id is empty', () => {
      const { result } = renderHook(() => useNote(''), { wrapper: createWrapper() });

      expect(result.current.fetchStatus).toBe('idle');
      expect(notes.get).not.toHaveBeenCalled();
    });
  });

  describe('useCreateNote', () => {
    it('creates a note and invalidates cache', async () => {
      const mockNote = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        title: 'New Note',
        content: {},
        plaintext: '',
        pinned: false,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      };

      const invalidateQueriesSpy = vi.fn();
      const queryClient = new QueryClient({
        defaultOptions: {
          queries: { retry: false },
          mutations: { retry: false },
        },
      });
      queryClient.invalidateQueries = invalidateQueriesSpy;

      function TestWrapper({ children }: { readonly children: React.ReactNode }) {
        return React.createElement(QueryClientProvider, { client: queryClient }, children);
      }

      vi.mocked(notes.create).mockResolvedValueOnce(mockNote);

      const { result } = renderHook(() => useCreateNote(), { wrapper: TestWrapper });

      await result.current.mutateAsync({ title: 'New Note' });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(mockNote);
      expect(notes.create).toHaveBeenCalledWith({ title: 'New Note' });
      expect(invalidateQueriesSpy).toHaveBeenCalledWith({ queryKey: ['notes'] });
    });
  });

  describe('useUpdateNote', () => {
    it('updates a note and invalidates cache', async () => {
      const mockNote = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        title: 'Updated Note',
        content: {},
        plaintext: '',
        pinned: false,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      };

      const invalidateQueriesSpy = vi.fn();
      const queryClient = new QueryClient({
        defaultOptions: {
          queries: { retry: false },
          mutations: { retry: false },
        },
      });
      queryClient.invalidateQueries = invalidateQueriesSpy;

      function TestWrapper({ children }: { readonly children: React.ReactNode }) {
        return React.createElement(QueryClientProvider, { client: queryClient }, children);
      }

      vi.mocked(notes.update).mockResolvedValueOnce(mockNote);

      const { result } = renderHook(() => useUpdateNote(), { wrapper: TestWrapper });

      await result.current.mutateAsync({
        id: '550e8400-e29b-41d4-a716-446655440000',
        data: { title: 'Updated Note' },
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(mockNote);
      expect(notes.update).toHaveBeenCalledWith('550e8400-e29b-41d4-a716-446655440000', {
        title: 'Updated Note',
      });
      expect(invalidateQueriesSpy).toHaveBeenCalledWith({ queryKey: ['notes'] });
      expect(invalidateQueriesSpy).toHaveBeenCalledWith({
        queryKey: ['note', '550e8400-e29b-41d4-a716-446655440000'],
      });
    });
  });

  describe('useDeleteNote', () => {
    it('deletes a note and invalidates cache', async () => {
      const invalidateQueriesSpy = vi.fn();
      const queryClient = new QueryClient({
        defaultOptions: {
          queries: { retry: false },
          mutations: { retry: false },
        },
      });
      queryClient.invalidateQueries = invalidateQueriesSpy;

      function TestWrapper({ children }: { readonly children: React.ReactNode }) {
        return React.createElement(QueryClientProvider, { client: queryClient }, children);
      }

      vi.mocked(notes.remove).mockResolvedValueOnce(undefined);

      const { result } = renderHook(() => useDeleteNote(), { wrapper: TestWrapper });

      await result.current.mutateAsync('550e8400-e29b-41d4-a716-446655440000');

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(notes.remove).toHaveBeenCalledWith('550e8400-e29b-41d4-a716-446655440000');
      expect(invalidateQueriesSpy).toHaveBeenCalledWith({ queryKey: ['notes'] });
    });
  });

  describe('useSearchNotes', () => {
    it('searches notes when query is not empty', async () => {
      const mockNotes = [
        {
          id: '550e8400-e29b-41d4-a716-446655440000',
          title: 'Test Note',
          preview: 'Test preview',
          pinned: false,
          updatedAt: '2024-01-01T00:00:00Z',
        },
      ];

      vi.mocked(notes.search).mockResolvedValueOnce(mockNotes);

      const { result } = renderHook(() => useSearchNotes('test'), { wrapper: createWrapper() });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(mockNotes);
      expect(notes.search).toHaveBeenCalledWith('test');
    });

    it('does not search when query is empty', () => {
      const { result } = renderHook(() => useSearchNotes(''), { wrapper: createWrapper() });

      expect(result.current.fetchStatus).toBe('idle');
      expect(notes.search).not.toHaveBeenCalled();
    });
  });
});
