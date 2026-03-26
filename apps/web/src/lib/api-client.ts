import { z } from 'zod';
import {
  noteSchema,
  createNoteSchema,
  updateNoteSchema,
  noteSummarySchema,
  type Note,
  type CreateNote,
  type UpdateNote,
  type NoteSummary,
} from '@graphite/shared';

const API_URL = import.meta.env.VITE_API_URL || '/api';

async function request<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({
      error: { code: 'UNKNOWN_ERROR', message: 'Unknown error' },
    }));
    throw new Error(error.error?.message || 'Request failed');
  }

  return response.json() as Promise<T>;
}

const notes = {
  list: async (): Promise<NoteSummary[]> => {
    const response = await request<{ data: NoteSummary[] }>('/notes');
    return z.array(noteSummarySchema).parse(response.data);
  },

  get: async (id: string): Promise<Note> => {
    const response = await request<{ data: Note }>(`/notes/${id}`);
    return noteSchema.parse(response.data);
  },

  create: async (data: CreateNote): Promise<Note> => {
    const response = await request<{ data: Note }>('/notes', {
      method: 'POST',
      body: JSON.stringify(createNoteSchema.parse(data)),
    });
    return noteSchema.parse(response.data);
  },

  update: async (id: string, data: UpdateNote): Promise<Note> => {
    const response = await request<{ data: Note }>(`/notes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updateNoteSchema.parse(data)),
    });
    return noteSchema.parse(response.data);
  },

  remove: async (id: string): Promise<void> => {
    await request<{ success: boolean }>(`/notes/${id}`, {
      method: 'DELETE',
    });
  },

  search: async (query: string): Promise<NoteSummary[]> => {
    const response = await request<{ data: NoteSummary[] }>(
      `/notes/search?q=${encodeURIComponent(query)}`,
    );
    return z.array(noteSummarySchema).parse(response.data);
  },
};

export { notes };
