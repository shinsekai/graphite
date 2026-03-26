import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { FloatingToolbar } from './floating-toolbar';

vi.mock('@tiptap/react', () => ({
  BubbleMenu: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="bubble-menu">{children}</div>
  ),
}));

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
    })),
  })),
  getAttributes: vi.fn(() => ({ href: '' })),
};

describe('FloatingToolbar', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendered buttons', () => {
    it('renders Bold button', () => {
      render(<FloatingToolbar editor={mockEditor as never} />);

      expect(screen.getByLabelText('Bold')).toBeInTheDocument();
    });

    it('renders Italic button', () => {
      render(<FloatingToolbar editor={mockEditor as never} />);

      expect(screen.getByLabelText('Italic')).toBeInTheDocument();
    });

    it('renders Underline button', () => {
      render(<FloatingToolbar editor={mockEditor as never} />);

      expect(screen.getByLabelText('Underline')).toBeInTheDocument();
    });

    it('renders Strikethrough button', () => {
      render(<FloatingToolbar editor={mockEditor as never} />);

      expect(screen.getByLabelText('Strikethrough')).toBeInTheDocument();
    });

    it('renders Inline code button', () => {
      render(<FloatingToolbar editor={mockEditor as never} />);

      expect(screen.getByLabelText('Inline code')).toBeInTheDocument();
    });

    it('renders Link button', () => {
      render(<FloatingToolbar editor={mockEditor as never} />);

      expect(screen.getByLabelText('Link')).toBeInTheDocument();
    });

    it('renders Heading 1 button', () => {
      render(<FloatingToolbar editor={mockEditor as never} />);

      expect(screen.getByLabelText('Heading 1')).toBeInTheDocument();
    });

    it('renders Heading 2 button', () => {
      render(<FloatingToolbar editor={mockEditor as never} />);

      expect(screen.getByLabelText('Heading 2')).toBeInTheDocument();
    });

    it('renders Heading 3 button', () => {
      render(<FloatingToolbar editor={mockEditor as never} />);

      expect(screen.getByLabelText('Heading 3')).toBeInTheDocument();
    });

    it('renders Bullet list button', () => {
      render(<FloatingToolbar editor={mockEditor as never} />);

      expect(screen.getByLabelText('Bullet list')).toBeInTheDocument();
    });

    it('renders Numbered list button', () => {
      render(<FloatingToolbar editor={mockEditor as never} />);

      expect(screen.getByLabelText('Numbered list')).toBeInTheDocument();
    });

    it('renders Blockquote button', () => {
      render(<FloatingToolbar editor={mockEditor as never} />);

      expect(screen.getByLabelText('Blockquote')).toBeInTheDocument();
    });
  });

  describe('Active states', () => {
    it('applies active class when Bold is active', () => {
      const activeEditor = { ...mockEditor, isActive: vi.fn(() => true) };

      render(<FloatingToolbar editor={activeEditor as never} />);

      const boldButton = screen.getByLabelText('Bold');
      const className = boldButton.className;
      expect(className).toContain('active');
    });
  });
});
