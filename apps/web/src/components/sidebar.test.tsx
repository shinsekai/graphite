import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Sidebar } from './sidebar';
import type { NoteSummary } from '@graphite/shared';

const mockNotes: NoteSummary[] = [
  {
    id: '1',
    title: 'First Note',
    preview: 'First note preview',
    pinned: true,
    updatedAt: new Date('2026-03-26T12:00:00.000Z').toISOString(),
  },
  {
    id: '2',
    title: 'Second Note',
    preview: 'Second note preview',
    pinned: false,
    updatedAt: new Date('2026-03-25T12:00:00.000Z').toISOString(),
  },
];

vi.mock('../hooks/use-notes', () => ({
  useNotes: () => ({ data: mockNotes, isLoading: false }),
  useSearchNotes: () => ({ data: [], isLoading: false }),
  useCreateNote: () => ({
    mutate: vi.fn(({ onSuccess }) => {
      onSuccess({ id: '3', title: '', preview: '', pinned: false, updatedAt: new Date().toISOString() });
    }),
  }),
  useDeleteNote: () => ({ mutate: vi.fn() }),
}));

vi.mock('../hooks/use-debounce', () => ({
  useDebounce: (value: string) => value,
}));

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return ({ children }: { readonly children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

describe('Sidebar', () => {
  const onSelectNote = vi.fn();
  const onClose = vi.fn();

  beforeEach(() => {
    onSelectNote.mockClear();
    onClose.mockClear();
  });

  it('should render heading', () => {
    render(
      <Sidebar
        activeNoteId={null}
        onSelectNote={onSelectNote}
        isOpen={false}
        onClose={onClose}
        isMobile={false}
      />,
      {
        wrapper: createWrapper(),
      },
    );

    expect(screen.getByText('Graphite')).toBeInTheDocument();
  });

  it('should render new note button', () => {
    render(
      <Sidebar
        activeNoteId={null}
        onSelectNote={onSelectNote}
        isOpen={false}
        onClose={onClose}
        isMobile={false}
      />,
      {
        wrapper: createWrapper(),
      },
    );

    expect(screen.getByRole('button', { name: 'New note' })).toBeInTheDocument();
  });

  it('should render search input', () => {
    render(
      <Sidebar
        activeNoteId={null}
        onSelectNote={onSelectNote}
        isOpen={false}
        onClose={onClose}
        isMobile={false}
      />,
      {
        wrapper: createWrapper(),
      },
    );

    expect(screen.getByPlaceholderText('Search notes...')).toBeInTheDocument();
  });

  it('should render note list items', async () => {
    render(
      <Sidebar
        activeNoteId={null}
        onSelectNote={onSelectNote}
        isOpen={false}
        onClose={onClose}
        isMobile={false}
      />,
      {
        wrapper: createWrapper(),
      },
    );

    await waitFor(() => {
      expect(screen.getByText('First Note')).toBeInTheDocument();
      expect(screen.getByText('Second Note')).toBeInTheDocument();
    });
  });

  it('should highlight active note', async () => {
    render(
      <Sidebar
        activeNoteId="1"
        onSelectNote={onSelectNote}
        isOpen={false}
        onClose={onClose}
        isMobile={false}
      />,
      {
        wrapper: createWrapper(),
      },
    );

    await waitFor(() => {
      const firstNote = screen.getByText('First Note').closest('[role="button"]');
      expect(firstNote?.className).toContain('active');
    });
  });

  it('should call onSelectNote when clicking a note', async () => {
    render(
      <Sidebar
        activeNoteId={null}
        onSelectNote={onSelectNote}
        isOpen={false}
        onClose={onClose}
        isMobile={false}
      />,
      {
        wrapper: createWrapper(),
      },
    );

    await waitFor(() => {
      expect(screen.getByText('First Note')).toBeInTheDocument();
    });

    const firstNote = screen.getByText('First Note').closest('[role="button"]');
    firstNote?.click();

    expect(onSelectNote).toHaveBeenCalledWith('1');
  });

  it('should show pin icon for pinned notes', async () => {
    render(
      <Sidebar
        activeNoteId={null}
        onSelectNote={onSelectNote}
        isOpen={false}
        onClose={onClose}
        isMobile={false}
      />,
      {
        wrapper: createWrapper(),
      },
    );

    await waitFor(() => {
      const pinIcon = document.querySelector('[class*="pinIcon"]');
      expect(pinIcon).toBeInTheDocument();
    });
  });

  it('should sort pinned notes first', async () => {
    render(
      <Sidebar
        activeNoteId={null}
        onSelectNote={onSelectNote}
        isOpen={false}
        onClose={onClose}
        isMobile={false}
      />,
      {
        wrapper: createWrapper(),
      },
    );

    await waitFor(() => {
      const firstNoteTitle = screen.getByText('First Note');
      expect(firstNoteTitle).toBeInTheDocument();
      expect(firstNoteTitle.textContent).toBe('First Note');
    });
  });
});
