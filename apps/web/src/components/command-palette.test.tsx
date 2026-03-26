import { render, screen, fireEvent, act, within } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { CommandPalette, createStandardCommands, type Command } from './command-palette';
import { FilePlus, Search as SearchIcon, Sun, Moon, Trash2 } from 'lucide-react';

const mockCommands: readonly Command[] = [
  {
    id: 'new-note',
    label: 'New note',
    icon: <FilePlus size={18} />,
    action: vi.fn(),
    shortcut: '⌘N',
  },
  {
    id: 'search',
    label: 'Search notes',
    icon: <SearchIcon size={18} />,
    action: vi.fn(),
    shortcut: '⌘P',
    category: 'Navigation',
  },
  {
    id: 'theme-light',
    label: 'Switch to light theme',
    icon: <Sun size={18} />,
    action: vi.fn(),
    shortcut: '',
    category: 'Settings',
  },
  {
    id: 'theme-dark',
    label: 'Switch to dark theme',
    icon: <Moon size={18} />,
    action: vi.fn(),
    shortcut: '',
    category: 'Settings',
  },
];

describe('CommandPalette', () => {
  it('should not render when isOpen is false', () => {
    const { container } = render(
      <CommandPalette isOpen={false} onClose={vi.fn()} commands={mockCommands} />,
    );

    const overlay = container.querySelector(`[role="presentation"]`);
    expect(overlay).not.toBeInTheDocument();
  });

  it('should render when isOpen is true', () => {
    render(<CommandPalette isOpen onClose={vi.fn()} commands={mockCommands} />);

    const palette = screen.getByRole('dialog', { name: 'Command palette' });
    expect(palette).toBeInTheDocument();
  });

  it('should display all commands', () => {
    render(<CommandPalette isOpen onClose={vi.fn()} commands={mockCommands} />);

    expect(screen.getByText('New note')).toBeInTheDocument();
    expect(screen.getByText('Search notes')).toBeInTheDocument();
    expect(screen.getByText('Switch to light theme')).toBeInTheDocument();
    expect(screen.getByText('Switch to dark theme')).toBeInTheDocument();
  });

  it('should display search input with placeholder', () => {
    render(<CommandPalette isOpen onClose={vi.fn()} commands={mockCommands} />);

    const input = screen.getByPlaceholderText('Type a command or search...');
    expect(input).toBeInTheDocument();
  });

  it('should filter commands by search query', () => {
    render(<CommandPalette isOpen onClose={vi.fn()} commands={mockCommands} />);

    const input = screen.getByPlaceholderText('Type a command or search...');
    fireEvent.change(input, { target: { value: 'theme' } });

    expect(screen.getByText('Switch to light theme')).toBeInTheDocument();
    expect(screen.getByText('Switch to dark theme')).toBeInTheDocument();
    expect(screen.queryByText('New note')).not.toBeInTheDocument();
    expect(screen.queryByText('Search notes')).not.toBeInTheDocument();
  });

  it('should show empty state when no commands match search', () => {
    render(<CommandPalette isOpen onClose={vi.fn()} commands={mockCommands} />);

    const input = screen.getByPlaceholderText('Type a command or search...');
    fireEvent.change(input, { target: { value: 'nonexistent' } });

    expect(screen.getByText('No commands found')).toBeInTheDocument();
  });

  it('should execute command when clicked', () => {
    const newNoteAction = vi.fn();
    const commandsWithMock = [
      {
        ...mockCommands[0],
        action: newNoteAction,
      },
    ];

    render(<CommandPalette isOpen onClose={vi.fn()} commands={commandsWithMock} />);

    const commandButton = screen.getByText('New note').closest('button');
    fireEvent.click(commandButton!);

    expect(newNoteAction).toHaveBeenCalledTimes(1);
  });

  it('should close palette after executing command', () => {
    const onClose = vi.fn();
    const newNoteAction = vi.fn();
    const commandsWithMock = [
      {
        ...mockCommands[0],
        action: newNoteAction,
      },
    ];

    render(<CommandPalette isOpen onClose={onClose} commands={commandsWithMock} />);

    const commandButton = screen.getByText('New note').closest('button');
    fireEvent.click(commandButton!);

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('should close palette when overlay is clicked', () => {
    const onClose = vi.fn();

    const { container } = render(<CommandPalette isOpen onClose={onClose} commands={mockCommands} />);

    const overlay = container.querySelector(`[role="presentation"]`);
    if (overlay) {
      fireEvent.click(overlay);
    }

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('should not close palette when palette content is clicked', () => {
    const onClose = vi.fn();

    render(<CommandPalette isOpen onClose={onClose} commands={mockCommands} />);

    const palette = screen.getByRole('dialog');
    fireEvent.click(palette);

    expect(onClose).not.toHaveBeenCalled();
  });

  it('should close palette when Escape key is pressed', () => {
    const onClose = vi.fn();
    const user = {
      keyboard: vi.fn(),
    };

    render(<CommandPalette isOpen onClose={onClose} commands={mockCommands} />);

    const palette = screen.getByRole('dialog');
    fireEvent.keyDown(palette, { key: 'Escape' });

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('should close palette when Escape key is pressed in input', () => {
    const onClose = vi.fn();

    render(<CommandPalette isOpen onClose={onClose} commands={mockCommands} />);

    const input = screen.getByPlaceholderText('Type a command or search...');
    fireEvent.keyDown(input, { key: 'Escape' });

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('should navigate with arrow down key', () => {
    render(<CommandPalette isOpen onClose={vi.fn()} commands={mockCommands} />);

    const palette = screen.getByRole('dialog');
    const firstCommand = screen.getByText('New note').closest('button');

    expect(firstCommand).toHaveAttribute('aria-selected', 'true');

    fireEvent.keyDown(palette, { key: 'ArrowDown' });

    expect(firstCommand).toHaveAttribute('aria-selected', 'false');
    expect(screen.getByText('Search notes').closest('button')).toHaveAttribute(
      'aria-selected',
      'true',
    );
  });

  it('should navigate with arrow up key', () => {
    render(<CommandPalette isOpen onClose={vi.fn()} commands={mockCommands} />);

    const palette = screen.getByRole('dialog');

    // Navigate down first
    fireEvent.keyDown(palette, { key: 'ArrowDown' });
    fireEvent.keyDown(palette, { key: 'ArrowDown' });

    // Navigate back up - should select Search notes (index 1)
    fireEvent.keyDown(palette, { key: 'ArrowUp' });

    expect(screen.getByText('Search notes').closest('button')).toHaveAttribute(
      'aria-selected',
      'true',
    );
    expect(screen.getByText('New note').closest('button')).toHaveAttribute(
      'aria-selected',
      'false',
    );
  });

  it('should wrap navigation to end when arrow down is pressed on last item', () => {
    render(<CommandPalette isOpen onClose={vi.fn()} commands={mockCommands} />);

    const palette = screen.getByRole('dialog');

    // Navigate to last item
    for (let i = 0; i < mockCommands.length - 1; i++) {
      fireEvent.keyDown(palette, { key: 'ArrowDown' });
    }

    const lastCommand = screen.getByText('Switch to dark theme').closest('button');
    expect(lastCommand).toHaveAttribute('aria-selected', 'true');

    // Press arrow down on last item
    fireEvent.keyDown(palette, { key: 'ArrowDown' });

    const firstCommand = screen.getByText('New note').closest('button');
    expect(firstCommand).toHaveAttribute('aria-selected', 'true');
  });

  it('should wrap navigation to start when arrow up is pressed on first item', () => {
    render(<CommandPalette isOpen onClose={vi.fn()} commands={mockCommands} />);

    const palette = screen.getByRole('dialog');

    // Press arrow up on first item
    fireEvent.keyDown(palette, { key: 'ArrowUp' });

    const lastCommand = screen.getByText('Switch to dark theme').closest('button');
    expect(lastCommand).toHaveAttribute('aria-selected', 'true');
  });

  it('should execute selected command with Enter key', () => {
    const searchAction = vi.fn();
    const commandsWithMock = [
      mockCommands[0],
      {
        ...mockCommands[1],
        action: searchAction,
      },
    ];

    render(<CommandPalette isOpen onClose={vi.fn()} commands={commandsWithMock} />);

    const palette = screen.getByRole('dialog');
    fireEvent.keyDown(palette, { key: 'ArrowDown' });
    fireEvent.keyDown(palette, { key: 'Enter' });

    expect(searchAction).toHaveBeenCalledTimes(1);
  });

  it('should filter and reset selection when search changes', () => {
    render(<CommandPalette isOpen onClose={vi.fn()} commands={mockCommands} />);

    const input = screen.getByPlaceholderText('Type a command or search...');

    // Filter to only "theme" commands
    fireEvent.change(input, { target: { value: 'theme' } });

    // First theme command should be selected
    expect(screen.getByText('Switch to light theme').closest('button')).toHaveAttribute(
      'aria-selected',
      'true',
    );

    // Clear search
    fireEvent.change(input, { target: { value: '' } });

    // Reset to first command
    expect(screen.getByText('New note').closest('button')).toHaveAttribute(
      'aria-selected',
      'true',
    );
  });

  it('should display keyboard shortcuts', () => {
    render(<CommandPalette isOpen onClose={vi.fn()} commands={mockCommands} />);

    expect(screen.getByText('⌘N')).toBeInTheDocument();
    expect(screen.getByText('⌘P')).toBeInTheDocument();
  });

  it('should display footer hints', () => {
    render(<CommandPalette isOpen onClose={vi.fn()} commands={mockCommands} />);

    expect(screen.getByText('↑↓ to navigate')).toBeInTheDocument();
    expect(screen.getByText('Enter to select')).toBeInTheDocument();
    expect(screen.getByText('Esc to close')).toBeInTheDocument();
  });

  it('should group commands by category when multiple categories exist', () => {
    render(<CommandPalette isOpen onClose={vi.fn()} commands={mockCommands} />);

    expect(screen.getByText('Navigation')).toBeInTheDocument();
    expect(screen.getByText('Settings')).toBeInTheDocument();
  });

  it('should auto-focus input on mount', () => {
    render(<CommandPalette isOpen onClose={vi.fn()} commands={mockCommands} />);

    const input = screen.getByPlaceholderText('Type a command or search...');
    expect(input).toHaveFocus();
  });

  it('should reset search and selection when palette opens', () => {
    const { rerender } = render(
      <CommandPalette isOpen onClose={vi.fn()} commands={mockCommands} />,
    );

    const input = screen.getByPlaceholderText('Type a command or search...');
    fireEvent.change(input, { target: { value: 'search' } });

    // Close and reopen
    rerender(<CommandPalette isOpen={false} onClose={vi.fn()} commands={mockCommands} />);
    rerender(<CommandPalette isOpen onClose={vi.fn()} commands={mockCommands} />);

    // Input should be empty
    const inputAfterReopen = screen.getByPlaceholderText('Type a command or search...');
    expect(inputAfterReopen).toHaveValue('');
  });
});

describe('createStandardCommands', () => {
  it('should create standard commands with correct labels and ids', () => {
    const handlers = {
      onNewNote: vi.fn(),
      onFocusSearch: vi.fn(),
      onToggleTheme: vi.fn(),
      currentTheme: 'dark' as const,
      onDeleteNote: vi.fn(),
      activeNoteId: 'note-123',
    };

    const commands = createStandardCommands(handlers);

    expect(commands).toHaveLength(4); // New note, Search, Delete note, Theme
    expect(commands[0].id).toBe('new-note');
    expect(commands[0].label).toBe('New note');
    expect(commands[1].id).toBe('search-notes');
    expect(commands[1].label).toBe('Search notes');
    expect(commands[2].id).toBe('delete-note');
    expect(commands[2].label).toBe('Delete note');
  });

  it('should include delete command only when activeNoteId exists', () => {
    const handlersWithNote = {
      onNewNote: vi.fn(),
      onFocusSearch: vi.fn(),
      onToggleTheme: vi.fn(),
      currentTheme: 'dark' as const,
      onDeleteNote: vi.fn(),
      activeNoteId: 'note-123',
    };

    const commandsWithNote = createStandardCommands(handlersWithNote);
    expect(commandsWithNote.find((c) => c.id === 'delete-note')).toBeDefined();

    const handlersWithoutNote = {
      ...handlersWithNote,
      activeNoteId: null,
    };

    const commandsWithoutNote = createStandardCommands(handlersWithoutNote);
    expect(commandsWithoutNote.find((c) => c.id === 'delete-note')).toBeUndefined();
  });

  it('should show correct theme label based on current theme', () => {
    const handlersDark = {
      onNewNote: vi.fn(),
      onFocusSearch: vi.fn(),
      onToggleTheme: vi.fn(),
      currentTheme: 'dark' as const,
      onDeleteNote: vi.fn(),
      activeNoteId: null,
    };

    const commandsDark = createStandardCommands(handlersDark);
    const themeCommandDark = commandsDark.find((c) => c.id === 'toggle-theme');
    expect(themeCommandDark?.label).toBe('Switch to light theme');

    const handlersLight = {
      ...handlersDark,
      currentTheme: 'light' as const,
    };

    const commandsLight = createStandardCommands(handlersLight);
    const themeCommandLight = commandsLight.find((c) => c.id === 'toggle-theme');
    expect(themeCommandLight?.label).toBe('Switch to dark theme');
  });

  it('should have delete command with correct label', () => {
    const handlers = {
      onNewNote: vi.fn(),
      onFocusSearch: vi.fn(),
      onToggleTheme: vi.fn(),
      currentTheme: 'dark' as const,
      onDeleteNote: vi.fn(),
      activeNoteId: 'note-123',
    };

    const commands = createStandardCommands(handlers);
    const deleteCommand = commands.find((c) => c.id === 'delete-note');
    expect(deleteCommand?.label).toBe('Delete note');
  });

  it('should set categories correctly', () => {
    const handlers = {
      onNewNote: vi.fn(),
      onFocusSearch: vi.fn(),
      onToggleTheme: vi.fn(),
      currentTheme: 'dark' as const,
      onDeleteNote: vi.fn(),
      activeNoteId: 'note-123',
    };

    const commands = createStandardCommands(handlers);
    expect(commands.find((c) => c.id === 'new-note')?.category).toBeUndefined();
    expect(commands.find((c) => c.id === 'search-notes')?.category).toBeUndefined();
    expect(commands.find((c) => c.id === 'delete-note')?.category).toBe('Note');
    expect(commands.find((c) => c.id === 'toggle-theme')?.category).toBe('Settings');
  });

  it('should set keyboard shortcuts correctly', () => {
    const handlers = {
      onNewNote: vi.fn(),
      onFocusSearch: vi.fn(),
      onToggleTheme: vi.fn(),
      currentTheme: 'dark' as const,
      onDeleteNote: vi.fn(),
      activeNoteId: 'note-123',
    };

    const commands = createStandardCommands(handlers);
    expect(commands.find((c) => c.id === 'new-note')?.shortcut).toBe('⌘N');
    expect(commands.find((c) => c.id === 'search-notes')?.shortcut).toBe('⌘P');
    expect(commands.find((c) => c.id === 'delete-note')?.shortcut).toBe('⌘⌫');
    expect(commands.find((c) => c.id === 'toggle-theme')?.shortcut).toBe('');
  });
});
