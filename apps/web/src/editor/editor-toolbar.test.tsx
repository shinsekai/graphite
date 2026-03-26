import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { EditorToolbar } from './editor-toolbar';

const mockEditor = {
  isActive: vi.fn(() => false),
  chain: vi.fn(() => ({
    focus: vi.fn(() => ({
      toggleBold: vi.fn(() => ({ run: vi.fn() })),
      toggleItalic: vi.fn(() => ({ run: vi.fn() })),
      toggleUnderline: vi.fn(() => ({ run: vi.fn() })),
      toggleStrike: vi.fn(() => ({ run: vi.fn() })),
      toggleCode: vi.fn(() => ({ run: vi.fn() })),
      setLink: vi.fn(() => ({ run: vi.fn() })),
      toggleHeading: vi.fn(() => ({ run: vi.fn() })),
      toggleBulletList: vi.fn(() => ({ run: vi.fn() })),
      toggleOrderedList: vi.fn(() => ({ run: vi.fn() })),
      toggleBlockquote: vi.fn(() => ({ run: vi.fn() })),
      toggleCodeBlock: vi.fn(() => ({ run: vi.fn() })),
      setHorizontalRule: vi.fn(() => ({ run: vi.fn() })),
    })),
  })),
  getAttributes: vi.fn(() => ({ href: '' })),
};

describe('EditorToolbar', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendered buttons', () => {
    it('renders Bold button', () => {
      render(<EditorToolbar editor={mockEditor as never} />);

      expect(screen.getByLabelText('Bold')).toBeInTheDocument();
    });

    it('renders Italic button', () => {
      render(<EditorToolbar editor={mockEditor as never} />);

      expect(screen.getByLabelText('Italic')).toBeInTheDocument();
    });

    it('renders Underline button', () => {
      render(<EditorToolbar editor={mockEditor as never} />);

      expect(screen.getByLabelText('Underline')).toBeInTheDocument();
    });

    it('renders Strikethrough button', () => {
      render(<EditorToolbar editor={mockEditor as never} />);

      expect(screen.getByLabelText('Strikethrough')).toBeInTheDocument();
    });

    it('renders Inline code button', () => {
      render(<EditorToolbar editor={mockEditor as never} />);

      expect(screen.getByLabelText('Inline code')).toBeInTheDocument();
    });

    it('renders Link button', () => {
      render(<EditorToolbar editor={mockEditor as never} />);

      expect(screen.getByLabelText('Link')).toBeInTheDocument();
    });

    it('renders Heading 1 button', () => {
      render(<EditorToolbar editor={mockEditor as never} />);

      expect(screen.getByLabelText('Heading 1')).toBeInTheDocument();
    });

    it('renders Heading 2 button', () => {
      render(<EditorToolbar editor={mockEditor as never} />);

      expect(screen.getByLabelText('Heading 2')).toBeInTheDocument();
    });

    it('renders Heading 3 button', () => {
      render(<EditorToolbar editor={mockEditor as never} />);

      expect(screen.getByLabelText('Heading 3')).toBeInTheDocument();
    });

    it('renders Bullet list button', () => {
      render(<EditorToolbar editor={mockEditor as never} />);

      expect(screen.getByLabelText('Bullet list')).toBeInTheDocument();
    });

    it('renders Numbered list button', () => {
      render(<EditorToolbar editor={mockEditor as never} />);

      expect(screen.getByLabelText('Numbered list')).toBeInTheDocument();
    });

    it('renders Blockquote button', () => {
      render(<EditorToolbar editor={mockEditor as never} />);

      expect(screen.getByLabelText('Blockquote')).toBeInTheDocument();
    });

    it('renders Code block button', () => {
      render(<EditorToolbar editor={mockEditor as never} />);

      expect(screen.getByLabelText('Code block')).toBeInTheDocument();
    });

    it('renders Horizontal rule button', () => {
      render(<EditorToolbar editor={mockEditor as never} />);

      expect(screen.getByLabelText('Horizontal rule')).toBeInTheDocument();
    });
  });

  describe('Active states', () => {
    it('applies active class when Bold is active', () => {
      const activeEditor = { ...mockEditor, isActive: vi.fn(() => true) };

      render(<EditorToolbar editor={activeEditor as never} />);

      const boldButton = screen.getByLabelText('Bold');
      const className = boldButton.className;
      expect(className).toContain('active');
    });

    it('applies active class when Code block is active', () => {
      const activeEditor = {
        ...mockEditor,
        isActive: vi.fn((format: string) => format === 'codeBlock'),
      };

      render(<EditorToolbar editor={activeEditor as never} />);

      const codeBlockButton = screen.getByLabelText('Code block');
      const className = codeBlockButton.className;
      expect(className).toContain('active');
    });
  });
});
