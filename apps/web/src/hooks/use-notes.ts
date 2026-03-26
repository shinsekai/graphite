import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notes } from '@/lib/api-client';
import type { CreateNote, UpdateNote } from '@graphite/shared';

export function useNotes() {
  return useQuery({
    queryKey: ['notes'],
    queryFn: notes.list,
  });
}

export function useNote(id: string) {
  return useQuery({
    queryKey: ['note', id],
    queryFn: () => notes.get(id),
    enabled: !!id,
  });
}

export function useCreateNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateNote) => notes.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
    },
  });
}

export function useUpdateNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { readonly id: string; readonly data: UpdateNote }) =>
      notes.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      queryClient.invalidateQueries({ queryKey: ['note', id] });
    },
  });
}

export function useDeleteNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => notes.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
    },
  });
}

export function useSearchNotes(query: string) {
  return useQuery({
    queryKey: ['notes', 'search', query],
    queryFn: () => notes.search(query),
    enabled: query.length > 0,
  });
}
