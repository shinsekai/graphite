import { useEffect, useCallback } from 'react';

export type ShortcutAction =
  | 'new-note'
  | 'focus-search'
  | 'toggle-palette'
  | 'force-save'
  | 'delete';

export interface KeyboardShortcutConfig {
  readonly key: string;
  readonly ctrlKey?: boolean;
  readonly shiftKey?: boolean;
  readonly metaKey?: boolean;
  readonly action: ShortcutAction;
}

const DEFAULT_SHORTCUTS: readonly KeyboardShortcutConfig[] = [
  { key: 'n', ctrlKey: true, action: 'new-note' },
  { key: 'p', ctrlKey: true, action: 'focus-search' },
  { key: 'k', ctrlKey: true, action: 'toggle-palette' },
  { key: 's', ctrlKey: true, action: 'force-save' },
  { key: 'Backspace', ctrlKey: true, action: 'delete' },
] as const;

interface ShortcutHandlers {
  readonly onNewNote?: () => void;
  readonly onFocusSearch?: () => void;
  readonly onTogglePalette?: () => void;
  readonly onForceSave?: () => void;
  readonly onDelete?: () => void;
}

function matchesShortcut(
  event: KeyboardEvent,
  config: KeyboardShortcutConfig,
): boolean {
  if (event.key.toLowerCase() !== config.key.toLowerCase()) {
    return false;
  }
  // Check Ctrl key (or Cmd as alternative)
  if (config.ctrlKey !== undefined) {
    if (config.ctrlKey !== event.ctrlKey && config.ctrlKey !== event.metaKey) {
      return false;
    }
  }
  // Check shift key only if specified
  if (config.shiftKey !== undefined && config.shiftKey !== event.shiftKey) {
    return false;
  }
  // Check meta key only if explicitly set (independent of ctrlKey check)
  if (config.metaKey !== undefined && config.metaKey !== event.metaKey) {
    return false;
  }
  return true;
}

/**
 * Hook for managing keyboard shortcuts throughout the application.
 *
 * This hook registers global keyboard shortcuts and triggers the corresponding
 * callback functions when shortcuts are pressed. Shortcuts are checked against
 * both Ctrl and Cmd (meta) keys for cross-platform compatibility.
 *
 * @param handlers - Callback functions for each shortcut action
 * @param shortcuts - Custom shortcut configurations (optional, defaults to built-in shortcuts)
 * @param enabled - Whether shortcuts are active (default: true)
 */
export function useKeyboardShortcuts(
  handlers: ShortcutHandlers,
  shortcuts: readonly KeyboardShortcutConfig[] = DEFAULT_SHORTCUTS,
  enabled: boolean = true,
): void {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled) {
        return;
      }

      // Ignore shortcuts when typing in input, textarea, or contenteditable elements
      const target = event.target as HTMLElement;
      if (
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target.isContentEditable
      ) {
        // Allow Ctrl+S to work even in editable elements (force save)
        if (event.key.toLowerCase() !== 's' || !event.ctrlKey) {
          return;
        }
      }

      for (const shortcut of shortcuts) {
        if (matchesShortcut(event, shortcut)) {
          event.preventDefault();

          switch (shortcut.action) {
            case 'new-note':
              handlers.onNewNote?.();
              break;
            case 'focus-search':
              handlers.onFocusSearch?.();
              break;
            case 'toggle-palette':
              handlers.onTogglePalette?.();
              break;
            case 'force-save':
              handlers.onForceSave?.();
              break;
            case 'delete':
              handlers.onDelete?.();
              break;
          }
          break;
        }
      }
    },
    [handlers, shortcuts, enabled],
  );

  useEffect(() => {
    if (!enabled) {
      return;
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown, enabled]);
}
