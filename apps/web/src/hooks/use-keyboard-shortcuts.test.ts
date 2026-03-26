import { renderHook, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useKeyboardShortcuts, type ShortcutAction } from './use-keyboard-shortcuts';

describe('useKeyboardShortcuts', () => {
  let testContainer: HTMLDivElement;

  beforeEach(() => {
    // Reset and create a fresh test container
    document.body.innerHTML = '';
    testContainer = document.createElement('div');
    document.body.appendChild(testContainer);
  });

  afterEach(() => {
    // Cleanup test container
    if (testContainer && testContainer.parentNode) {
      testContainer.parentNode.removeChild(testContainer);
    }
  });

  // Helper to dispatch keyboard event on body (which bubbles to window listener)
  function dispatchWindowEvent(key: string, modifiers: {
    ctrlKey?: boolean;
    shiftKey?: boolean;
    metaKey?: boolean;
  }): void {
    const event = new KeyboardEvent('keydown', {
      key,
      ...modifiers,
      bubbles: true,
      cancelable: true,
    });
    // Dispatch on body - it will bubble up to the window listener
    // The target will be body, which is not an input/textarea
    document.body.dispatchEvent(event);
  }

  it('should setup event listener on mount', () => {
    const addEventListenerSpy = vi.spyOn(window, 'addEventListener');
    const onNewNote = vi.fn();

    renderHook(() =>
      useKeyboardShortcuts({
        onNewNote,
      }),
    );

    expect(addEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
    addEventListenerSpy.mockRestore();
  });

  it('should remove event listener on unmount', () => {
    const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');

    const { unmount } = renderHook(() =>
      useKeyboardShortcuts({
        onNewNote: vi.fn(),
      }),
    );

    unmount();
    expect(removeEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
    removeEventListenerSpy.mockRestore();
  });

  it('should not trigger when typing in input element', () => {
    const onNewNote = vi.fn();
    renderHook(() =>
      useKeyboardShortcuts({
        onNewNote,
      }),
    );

    const input = document.createElement('input');
    testContainer.appendChild(input);
    input.focus();

    fireEvent.keyDown(input, { key: 'n', ctrlKey: true });

    expect(onNewNote).not.toHaveBeenCalled();
  });

  it('should not trigger when typing in textarea element', () => {
    const onNewNote = vi.fn();
    renderHook(() =>
      useKeyboardShortcuts({
        onNewNote,
      }),
    );

    const textarea = document.createElement('textarea');
    testContainer.appendChild(textarea);
    textarea.focus();

    fireEvent.keyDown(textarea, { key: 'n', ctrlKey: true });

    expect(onNewNote).not.toHaveBeenCalled();
  });

  it('should not trigger handlers when shortcuts are disabled', () => {
    const onNewNote = vi.fn();
    renderHook(() =>
      useKeyboardShortcuts(
        {
          onNewNote,
        },
        [],
        false,
      ),
    );

    // When disabled, shortcuts won't trigger
    dispatchWindowEvent('n', { ctrlKey: true });

    expect(onNewNote).not.toHaveBeenCalled();
  });

  it('should not call handlers for unregistered key combinations', () => {
    const onNewNote = vi.fn();
    renderHook(() =>
      useKeyboardShortcuts({
        onNewNote,
      }),
    );

    // Simulate unregistered key (Ctrl+X is not a default shortcut)
    dispatchWindowEvent('x', { ctrlKey: true });

    expect(onNewNote).not.toHaveBeenCalled();
  });

  it('should use custom shortcuts when provided', () => {
    const customHandler = vi.fn();
    const customShortcuts = [
      {
        key: 'x',
        ctrlKey: true,
        action: 'new-note' as ShortcutAction,
      },
    ];

    renderHook(() =>
      useKeyboardShortcuts(
        {
          onNewNote: customHandler,
        },
        customShortcuts,
      ),
    );

    // Simulate Ctrl+X which is now registered
    dispatchWindowEvent('x', { ctrlKey: true });

    expect(customHandler).toHaveBeenCalledTimes(1);
  });

  it('should handle custom shortcuts with shift modifier', () => {
    const customHandler = vi.fn();
    const customShortcuts = [
      {
        key: 'n',
        ctrlKey: true,
        shiftKey: true,
        action: 'new-note' as ShortcutAction,
      },
    ];

    renderHook(() =>
      useKeyboardShortcuts(
        {
          onNewNote: customHandler,
        },
        customShortcuts,
      ),
    );

    // Should trigger with Ctrl+Shift+N
    dispatchWindowEvent('n', { ctrlKey: true, shiftKey: true });
    expect(customHandler).toHaveBeenCalledTimes(1);

    customHandler.mockClear();

    // Should not trigger without shift
    dispatchWindowEvent('n', { ctrlKey: true, shiftKey: false });
    expect(customHandler).not.toHaveBeenCalled();
  });

  it('should handle case-insensitive key matching', () => {
    const onNewNote = vi.fn();
    renderHook(() =>
      useKeyboardShortcuts({
        onNewNote,
      }),
    );

    // Test uppercase 'N'
    dispatchWindowEvent('N', { ctrlKey: true });
    expect(onNewNote).toHaveBeenCalledTimes(1);
  });

  it('should support Ctrl+N shortcut', () => {
    const onNewNote = vi.fn();
    renderHook(() =>
      useKeyboardShortcuts({
        onNewNote,
      }),
    );

    dispatchWindowEvent('n', { ctrlKey: true });
    expect(onNewNote).toHaveBeenCalledTimes(1);
  });

  it('should support Ctrl+P shortcut', () => {
    const onFocusSearch = vi.fn();
    renderHook(() =>
      useKeyboardShortcuts({
        onFocusSearch,
      }),
    );

    dispatchWindowEvent('p', { ctrlKey: true });
    expect(onFocusSearch).toHaveBeenCalledTimes(1);
  });

  it('should support Ctrl+K shortcut', () => {
    const onTogglePalette = vi.fn();
    renderHook(() =>
      useKeyboardShortcuts({
        onTogglePalette,
      }),
    );

    dispatchWindowEvent('k', { ctrlKey: true });
    expect(onTogglePalette).toHaveBeenCalledTimes(1);
  });

  it('should support Ctrl+S shortcut', () => {
    const onForceSave = vi.fn();
    renderHook(() =>
      useKeyboardShortcuts({
        onForceSave,
      }),
    );

    dispatchWindowEvent('s', { ctrlKey: true });
    expect(onForceSave).toHaveBeenCalledTimes(1);
  });

  it('should support Ctrl+Backspace shortcut', () => {
    const onDelete = vi.fn();
    renderHook(() =>
      useKeyboardShortcuts({
        onDelete,
      }),
    );

    dispatchWindowEvent('Backspace', { ctrlKey: true });
    expect(onDelete).toHaveBeenCalledTimes(1);
  });

  it('should allow Ctrl+S to work even in editable elements', () => {
    const onForceSave = vi.fn();
    renderHook(() =>
      useKeyboardShortcuts({
        onForceSave,
      }),
    );

    const input = document.createElement('input');
    testContainer.appendChild(input);
    input.focus();

    // For Ctrl+S, we need to dispatch the event directly with the input as target
    const event = new KeyboardEvent('keydown', {
      key: 's',
      ctrlKey: true,
      bubbles: true,
      cancelable: true,
    });
    Object.defineProperty(event, 'target', {
      value: input,
      writable: false,
    });
    Object.defineProperty(event, 'currentTarget', {
      value: window,
      writable: false,
    });
    window.dispatchEvent(event);

    expect(onForceSave).toHaveBeenCalledTimes(1);
  });

  it('should support Cmd key as alternative to Ctrl for macOS compatibility', () => {
    const onNewNote = vi.fn();
    renderHook(() =>
      useKeyboardShortcuts({
        onNewNote,
      }),
    );

    dispatchWindowEvent('n', { metaKey: true });
    expect(onNewNote).toHaveBeenCalledTimes(1);
  });
});
