import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { NoteEditor } from './note-editor';
import styles from './note-editor.module.css';

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
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Empty state', () => {
    it('displays empty state when no note is selected', () => {
      render(<NoteEditor note={null} />);

      expect(screen.getByText('Select a note to start editing...')).toBeInTheDocument();
    });

    it('applies empty styling class', () => {
      const { container } = render(<NoteEditor note={null} />);

      const emptyDiv = container.querySelector(`.${styles.empty}`);
      expect(emptyDiv).toBeInTheDocument();
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

    it('applies correct class to title input', () => {
      const note = {
        id: '1',
        title: 'Test',
        content: { type: 'doc', content: [] },
      };

      const { container } = render(<NoteEditor note={note} />);

      const titleInput = container.querySelector(`.${styles.titleInput}`);
      expect(titleInput).toBeInTheDocument();
    });

    it('applies prose-editor class to editor content', () => {
      const note = {
        id: '1',
        title: 'Test',
        content: { type: 'doc', content: [] },
      };

      const { container } = render(<NoteEditor note={note} />);

      const editorContent = container.querySelector('.prose-editor');
      expect(editorContent).toBeInTheDocument();
    });
  });

  describe('Save status structure', () => {
    it('renders status container with correct class', () => {
      const note = {
        id: '1',
        title: 'Test',
        content: { type: 'doc', content: [] },
      };

      const { container } = render(<NoteEditor note={note} />);

      const statusDiv = container.querySelector(`.${styles.status}`);
      expect(statusDiv).toBeInTheDocument();
    });

    it('has defined CSS classes for all save statuses', () => {
      // Verify the CSS module exports the expected classes
      expect(styles.saving).toBeDefined();
      expect(styles.saved).toBeDefined();
      expect(styles.retry).toBeDefined();
    });
  });

  describe('Content styles rendering', () => {
    it('applies editorWrapper class for scrollable content area', () => {
      const note = {
        id: '1',
        title: 'Test',
        content: { type: 'doc', content: [] },
      };

      const { container } = render(<NoteEditor note={note} />);

      const editorWrapper = container.querySelector(`.${styles.editorWrapper}`);
      expect(editorWrapper).toBeInTheDocument();
    });

    it('applies toolbarContainer class to toolbar wrapper', () => {
      const note = {
        id: '1',
        title: 'Test',
        content: { type: 'doc', content: [] },
      };

      const { container } = render(<NoteEditor note={note} />);

      const toolbarContainer = container.querySelector(`.${styles.toolbarContainer}`);
      expect(toolbarContainer).toBeInTheDocument();
    });

    it('applies header class to header section', () => {
      const note = {
        id: '1',
        title: 'Test',
        content: { type: 'doc', content: [] },
      };

      const { container } = render(<NoteEditor note={note} />);

      const header = container.querySelector(`.${styles.header}`);
      expect(header).toBeInTheDocument();
    });

    it('applies container class to main wrapper', () => {
      const note = {
        id: '1',
        title: 'Test',
        content: { type: 'doc', content: [] },
      };

      const { container } = render(<NoteEditor note={note} />);

      const containerDiv = container.querySelector(`.${styles.container}`);
      expect(containerDiv).toBeInTheDocument();
    });

    it('applies editorContent class alongside prose-editor', () => {
      const note = {
        id: '1',
        title: 'Test',
        content: { type: 'doc', content: [] },
      };

      const { container } = render(<NoteEditor note={note} />);

      const editorContent = container.querySelector(`.${styles.editorContent}.prose-editor`);
      expect(editorContent).toBeInTheDocument();
    });
  });
});
