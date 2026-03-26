import { render } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { App } from './app';

vi.mock('../hooks/use-notes', () => ({
  useNotes: () => ({ data: [], isLoading: false }),
  useSearchNotes: () => ({ data: [], isLoading: false }),
  useCreateNote: () => ({ mutate: vi.fn() }),
  useDeleteNote: () => ({ mutate: vi.fn() }),
  useNote: () => ({ data: null, isLoading: false }),
}));

vi.mock('../hooks/use-debounce', () => ({
  useDebounce: (value: string) => value,
}));

vi.mock('../editor/note-editor', () => ({
  NoteEditor: vi.fn(({ note }) =>
    note ? <div>Note Editor</div> : <p>Select a note to start editing...</p>,
  ),
}));

function getLocalStorageMock() {
  const store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      Object.keys(store).forEach((key) => delete store[key]);
    },
  };
}

describe('@graphite/web', () => {
  let localStorageMock: ReturnType<typeof getLocalStorageMock>;

  beforeEach(() => {
    localStorageMock = getLocalStorageMock();
    vi.stubGlobal('localStorage', localStorageMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('renders Graphite heading', () => {
    localStorageMock.setItem('auth_token', 'test-token');

    const queryClient = new QueryClient();

    const { container } = render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </QueryClientProvider>,
    );
    expect(container.querySelector('h1')?.textContent).toBe('Graphite');
  });

  it('performs a basic arithmetic check', () => {
    expect(1 + 1).toBe(2);
  });
});
