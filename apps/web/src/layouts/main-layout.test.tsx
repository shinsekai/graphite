import { render, screen, fireEvent, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MainLayout } from './main-layout';

vi.mock('../components/sidebar', () => ({
  Sidebar: vi.fn(({ activeNoteId, onSelectNote }) => (
    <aside data-testid="sidebar">
      <button onClick={() => onSelectNote('123')}>Select Note</button>
    </aside>
  )),
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

describe('MainLayout', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render sidebar', () => {
    render(<MainLayout />, { wrapper: createWrapper() });

    expect(screen.getByTestId('sidebar')).toBeInTheDocument();
  });

  it('should render main content area', () => {
    render(<MainLayout />, { wrapper: createWrapper() });

    const main = screen.getByRole('main');
    expect(main).toBeInTheDocument();
  });

  it('should show placeholder when no note is selected', () => {
    render(<MainLayout />, { wrapper: createWrapper() });

    expect(
      screen.getByText('Select a note to start editing...'),
    ).toBeInTheDocument();
  });

  it('should handle note selection', () => {
    render(<MainLayout />, { wrapper: createWrapper() });

    const selectButton = screen.getByText('Select Note');

    act(() => {
      selectButton.click();
    });

    expect(screen.getByText('Note editor for 123')).toBeInTheDocument();
  });
});
