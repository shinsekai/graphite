import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { NoteEditor } from './note-editor';

vi.mock('./floating-toolbar', () => ({
  FloatingToolbar: () => null,
}));

vi.mock('./editor-toolbar', () => ({
  EditorToolbar: () => null,
}));

vi.mock('../hooks/use-notes', () => ({
  useUpdateNote: vi.fn(() => ({
    mutateAsync: vi.fn().mockResolvedValue({ id: '1', title: 'Test', content: {} }),
    mutate: vi.fn(),
  })),
}));

describe('NoteEditor', () => {
  describe('Empty state', () => {
    it('displays empty state when no note is selected', () => {
      render(<NoteEditor note={null} />);

      expect(
        screen.getByText('Select a note to start editing...'),
      ).toBeInTheDocument();
    });
  });

  describe('Loaded state', () => {
    it('displays note title in input', () => {
      const note = {
        id: '1',
        title: 'Test Note',
        content: { type: 'doc', content: [] },
      };

      render(<NoteEditor note={note} />);

      const titleInput = screen.getByPlaceholderText('Untitled note');
      expect(titleInput).toHaveValue('Test Note');
    });

    it('renders title input with placeholder', () => {
      const note = {
        id: '1',
        title: '',
        content: { type: 'doc', content: [] },
      };

      render(<NoteEditor note={note} />);

      const titleInput = screen.getByPlaceholderText('Untitled note');
      expect(titleInput).toBeInTheDocument();
    });
  });
});
