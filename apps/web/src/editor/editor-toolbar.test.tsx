import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { EditorToolbar } from './editor-toolbar';
import styles from './editor-toolbar.module.css';

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

  describe('Toolbar container', () => {
    it('applies toolbar class to container', () => {
      const { container } = render(<EditorToolbar editor={mockEditor as never} />);

      const toolbar = container.querySelector(`.${styles.toolbar}`);
      expect(toolbar).toBeInTheDocument();
    });
  });

  describe('Active states', () => {
    it('applies active class when Bold is active', () => {
      const activeEditor = { ...mockEditor, isActive: vi.fn(() => true) };

      render(<EditorToolbar editor={activeEditor as never} />);

      const boldButton = screen.getByLabelText('Bold');
      const className = boldButton.className;
      expect(className).toContain(styles.active);
    });

    it('applies active class when Italic is active', () => {
      const activeEditor = {
        ...mockEditor,
        isActive: vi.fn((format: string) => format === 'italic'),
      };

      render(<EditorToolbar editor={activeEditor as never} />);

      const italicButton = screen.getByLabelText('Italic');
      const className = italicButton.className;
      expect(className).toContain(styles.active);
    });

    it('applies active class when Underline is active', () => {
      const activeEditor = {
        ...mockEditor,
        isActive: vi.fn((format: string) => format === 'underline'),
      };

      render(<EditorToolbar editor={activeEditor as never} />);

      const underlineButton = screen.getByLabelText('Underline');
      const className = underlineButton.className;
      expect(className).toContain(styles.active);
    });

    it('applies active class when Strikethrough is active', () => {
      const activeEditor = {
        ...mockEditor,
        isActive: vi.fn((format: string) => format === 'strike'),
      };

      render(<EditorToolbar editor={activeEditor as never} />);

      const strikeButton = screen.getByLabelText('Strikethrough');
      const className = strikeButton.className;
      expect(className).toContain(styles.active);
    });

    it('applies active class when Code is active', () => {
      const activeEditor = {
        ...mockEditor,
        isActive: vi.fn((format: string) => format === 'code'),
      };

      render(<EditorToolbar editor={activeEditor as never} />);

      const codeButton = screen.getByLabelText('Inline code');
      const className = codeButton.className;
      expect(className).toContain(styles.active);
    });

    it('applies active class when Link is active', () => {
      const activeEditor = {
        ...mockEditor,
        isActive: vi.fn((format: string) => format === 'link'),
      };

      render(<EditorToolbar editor={activeEditor as never} />);

      const linkButton = screen.getByLabelText('Link');
      const className = linkButton.className;
      expect(className).toContain(styles.active);
    });

    it('applies active class when Heading 1 is active', () => {
      const activeEditor = {
        ...mockEditor,
        isActive: vi.fn(
          (format: string, attrs?: { level?: number }) =>
            format === 'heading' && attrs?.level === 1,
        ),
      };

      render(<EditorToolbar editor={activeEditor as never} />);

      const headingButton = screen.getByLabelText('Heading 1');
      const className = headingButton.className;
      expect(className).toContain(styles.active);
    });

    it('applies active class when Heading 2 is active', () => {
      const activeEditor = {
        ...mockEditor,
        isActive: vi.fn(
          (format: string, attrs?: { level?: number }) =>
            format === 'heading' && attrs?.level === 2,
        ),
      };

      render(<EditorToolbar editor={activeEditor as never} />);

      const headingButton = screen.getByLabelText('Heading 2');
      const className = headingButton.className;
      expect(className).toContain(styles.active);
    });

    it('applies active class when Heading 3 is active', () => {
      const activeEditor = {
        ...mockEditor,
        isActive: vi.fn(
          (format: string, attrs?: { level?: number }) =>
            format === 'heading' && attrs?.level === 3,
        ),
      };

      render(<EditorToolbar editor={activeEditor as never} />);

      const headingButton = screen.getByLabelText('Heading 3');
      const className = headingButton.className;
      expect(className).toContain(styles.active);
    });

    it('applies active class when Bullet list is active', () => {
      const activeEditor = {
        ...mockEditor,
        isActive: vi.fn((format: string) => format === 'bulletList'),
      };

      render(<EditorToolbar editor={activeEditor as never} />);

      const listButton = screen.getByLabelText('Bullet list');
      const className = listButton.className;
      expect(className).toContain(styles.active);
    });

    it('applies active class when Ordered list is active', () => {
      const activeEditor = {
        ...mockEditor,
        isActive: vi.fn((format: string) => format === 'orderedList'),
      };

      render(<EditorToolbar editor={activeEditor as never} />);

      const listButton = screen.getByLabelText('Numbered list');
      const className = listButton.className;
      expect(className).toContain(styles.active);
    });

    it('applies active class when Blockquote is active', () => {
      const activeEditor = {
        ...mockEditor,
        isActive: vi.fn((format: string) => format === 'blockquote'),
      };

      render(<EditorToolbar editor={activeEditor as never} />);

      const quoteButton = screen.getByLabelText('Blockquote');
      const className = quoteButton.className;
      expect(className).toContain(styles.active);
    });

    it('applies active class when Code block is active', () => {
      const activeEditor = {
        ...mockEditor,
        isActive: vi.fn((format: string) => format === 'codeBlock'),
      };

      render(<EditorToolbar editor={activeEditor as never} />);

      const codeBlockButton = screen.getByLabelText('Code block');
      const className = codeBlockButton.className;
      expect(className).toContain(styles.active);
    });
  });

  describe('Separators', () => {
    it('renders separators between button groups', () => {
      const { container } = render(<EditorToolbar editor={mockEditor as never} />);

      const dividers = container.querySelectorAll(`.${styles.divider}`);
      expect(dividers.length).toBeGreaterThan(0);
    });
  });
});
