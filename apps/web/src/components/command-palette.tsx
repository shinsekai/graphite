import { useState, useRef, useEffect, useCallback } from 'react';
import { Search, Check, FilePlus, Search as SearchIcon, Sun, Moon, Trash2, X } from 'lucide-react';
import styles from './command-palette.module.css';

export interface Command {
  readonly id: string;
  readonly label: string;
  readonly icon: React.ReactNode;
  readonly action: () => void;
  readonly shortcut?: string;
  readonly category?: string;
}

interface CommandPaletteProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly commands: readonly Command[];
}

const DEFAULT_CATEGORY = 'General';

export function CommandPalette({
  isOpen,
  onClose,
  commands,
}: CommandPaletteProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  // Reset state when palette opens
  useEffect(() => {
    if (isOpen) {
      setSearchQuery('');
      setSelectedIndex(0);
      inputRef.current?.focus();
    }
  }, [isOpen]);

  // Focus input when mounted
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const filteredCommands = commands.filter((command) =>
    command.label.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const categories = Array.from(
    new Set(filteredCommands.map((c) => c.category ?? DEFAULT_CATEGORY)),
  );

  const commandsByCategory = categories.map((category) => ({
    category,
    commands: filteredCommands.filter(
      (c) => (c.category ?? DEFAULT_CATEGORY) === category,
    ),
  }));

  const flatFilteredCommands = filteredCommands;

  const executeCommand = useCallback(
    (command: Command) => {
      command.action();
      onClose();
    },
    [onClose],
  );

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      switch (event.key) {
        case 'ArrowDown':
          event.preventDefault();
          setSelectedIndex((prev) =>
            prev < flatFilteredCommands.length - 1 ? prev + 1 : 0,
          );
          break;
        case 'ArrowUp':
          event.preventDefault();
          setSelectedIndex((prev) =>
            prev > 0 ? prev - 1 : flatFilteredCommands.length - 1,
          );
          break;
        case 'Enter':
          event.preventDefault();
          // Get current command from state to avoid closure issues
          setSelectedIndex((prevIndex) => {
            const command = flatFilteredCommands[prevIndex];
            if (command) {
              executeCommand(command);
            }
            return prevIndex;
          });
          break;
        case 'Escape':
          event.preventDefault();
          event.stopPropagation();
          onClose();
          break;
      }
    },
    [flatFilteredCommands, executeCommand, onClose],
  );

  useEffect(() => {
    if (listRef.current) {
      const selectedItem = listRef.current.querySelector(
        `[data-index="${selectedIndex}"]`,
      );
      if (selectedItem && 'scrollIntoView' in selectedItem) {
        (selectedItem as HTMLElement).scrollIntoView({ block: 'nearest' });
      }
    }
  }, [selectedIndex]);

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className={styles.overlay}
      onClick={onClose}
      role="presentation"
    >
      <div
        className={styles.palette}
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
        role="dialog"
        aria-modal="true"
        aria-label="Command palette"
      >
        <div className={styles.inputContainer}>
          <Search size={18} className={styles.searchIcon} />
          <input
            ref={inputRef}
            type="text"
            className={styles.input}
            placeholder="Type a command or search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            autoComplete="off"
            autoCapitalize="off"
          />
          <kbd className={styles.kbdHint}>Esc</kbd>
        </div>
        {flatFilteredCommands.length === 0 ? (
          <div className={styles.empty}>No commands found</div>
        ) : (
          <ul ref={listRef} className={styles.commandList} role="listbox">
            {commandsByCategory.map(({ category: cat, commands: catCommands }) => (
              <li key={cat} className={styles.categoryGroup}>
                {categories.length > 1 && (
                  <div className={styles.categoryLabel}>{cat}</div>
                )}
                <ul className={styles.categoryCommands}>
                  {catCommands.map((command) => {
                    const index = flatFilteredCommands.indexOf(command);
                    return (
                      <li key={command.id}>
                        <button
                          type="button"
                          className={`${styles.commandItem} ${
                            index === selectedIndex ? styles.selected : ''
                          }`}
                          onClick={() => executeCommand(command)}
                          data-index={index}
                          role="option"
                          aria-selected={index === selectedIndex}
                        >
                          <span className={styles.commandIcon}>{command.icon}</span>
                          <span className={styles.commandLabel}>{command.label}</span>
                          {command.shortcut && (
                            <kbd className={styles.shortcut}>{command.shortcut}</kbd>
                          )}
                          {index === selectedIndex && (
                            <Check size={14} className={styles.checkIcon} />
                          )}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </li>
            ))}
          </ul>
        )}
        <div className={styles.footer}>
          <span className={styles.footerHint}>↑↓ to navigate</span>
          <span className={styles.footerHint}>Enter to select</span>
          <span className={styles.footerHint}>Esc to close</span>
        </div>
      </div>
    </div>
  );
}

// Helper to create standard commands
export function createStandardCommands(handlers: {
  readonly onNewNote: () => void;
  readonly onFocusSearch: () => void;
  readonly onToggleTheme: (theme: 'dark' | 'light') => void;
  readonly currentTheme: 'dark' | 'light';
  readonly onDeleteNote: () => void;
  readonly activeNoteId: string | null;
}): readonly Command[] {
  const commands: Command[] = [
    {
      id: 'new-note',
      label: 'New note',
      icon: <FilePlus size={18} />,
      action: handlers.onNewNote,
      shortcut: '⌘N',
    },
    {
      id: 'search-notes',
      label: 'Search notes',
      icon: <SearchIcon size={18} />,
      action: handlers.onFocusSearch,
      shortcut: '⌘P',
    },
  ];

  if (handlers.activeNoteId) {
    commands.push({
      id: 'delete-note',
      label: 'Delete note',
      icon: <Trash2 size={18} />,
      action: handlers.onDeleteNote,
      shortcut: '⌘⌫',
      category: 'Note',
    });
  }

  commands.push({
    id: 'toggle-theme',
    label: `Switch to ${handlers.currentTheme === 'dark' ? 'light' : 'dark'} theme`,
    icon: handlers.currentTheme === 'dark' ? <Sun size={18} /> : <Moon size={18} />,
    action: () => handlers.onToggleTheme(handlers.currentTheme === 'dark' ? 'light' : 'dark'),
    shortcut: '',
    category: 'Settings',
  });

  return commands;
}
