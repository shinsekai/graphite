import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeToggle } from './theme-toggle';

const STORAGE_KEY = 'graphite-theme';

describe('ThemeToggle', () => {
  let mockStorage: Map<string, string>;

  beforeEach(() => {
    // Mock localStorage with simple in-memory implementation
    mockStorage = new Map<string, string>();
    vi.spyOn(localStorage, 'getItem').mockImplementation(
      (key: string) => mockStorage.get(key) ?? null,
    );
    vi.spyOn(localStorage, 'setItem').mockImplementation(
      (key: string, value: string) => mockStorage.set(key, value),
    );
    vi.spyOn(localStorage, 'removeItem').mockImplementation(
      (key: string) => mockStorage.delete(key),
    );
    vi.spyOn(localStorage, 'clear').mockImplementation(() => mockStorage.clear());
    // Clear mock storage before each test
    mockStorage.clear();
    // Reset document attribute
    document.documentElement.removeAttribute('data-theme');
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  describe('default rendering', () => {
    it('renders with Sun icon when theme is dark', () => {
      mockStorage.set(STORAGE_KEY, 'dark');
      render(<ThemeToggle />);

      const button = screen.getByRole('button', { name: /switch to light theme/i });
      expect(button).toBeInTheDocument();
      expect(button).toHaveAttribute('aria-label', 'Switch to light theme');
    });

    it('renders with Moon icon when theme is light', () => {
      mockStorage.set(STORAGE_KEY, 'light');
      render(<ThemeToggle />);

      const button = screen.getByRole('button', { name: /switch to dark theme/i });
      expect(button).toBeInTheDocument();
      expect(button).toHaveAttribute('aria-label', 'Switch to dark theme');
    });

    it('has correct CSS module class', () => {
      render(<ThemeToggle />);

      const button = screen.getByRole('button');
      // CSS Modules transforms class names, so check for the pattern
      expect(button.className).toMatch(/themeToggle/);
    });
  });

  describe('theme toggling', () => {
    it('toggles from dark to light when clicked', async () => {
      mockStorage.set(STORAGE_KEY, 'dark');
      const user = userEvent.setup();
      render(<ThemeToggle />);

      const button = screen.getByRole('button', { name: /switch to light theme/i });
      expect(document.documentElement.getAttribute('data-theme')).toBe('dark');

      await user.click(button);

      expect(document.documentElement.getAttribute('data-theme')).toBe('light');
    });

    it('toggles from light to dark when clicked', async () => {
      mockStorage.set(STORAGE_KEY, 'light');
      const user = userEvent.setup();
      render(<ThemeToggle />);

      const button = screen.getByRole('button', { name: /switch to dark theme/i });
      expect(document.documentElement.getAttribute('data-theme')).toBe('light');

      await user.click(button);

      expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    });

    it('persists theme to localStorage on click', async () => {
      mockStorage.set(STORAGE_KEY, 'dark');
      const user = userEvent.setup();
      render(<ThemeToggle />);

      const button = screen.getByRole('button');
      await user.click(button);

      expect(mockStorage.get(STORAGE_KEY)).toBe('light');
    });
  });

  describe('accessibility', () => {
    it('is focusable with keyboard', () => {
      render(<ThemeToggle />);

      const button = screen.getByRole('button');
      expect(button).toBeEnabled();
    });

    it('responds to Enter key', async () => {
      mockStorage.set(STORAGE_KEY, 'dark');
      const user = userEvent.setup();
      render(<ThemeToggle />);

      const button = screen.getByRole('button');
      expect(document.documentElement.getAttribute('data-theme')).toBe('dark');

      button.focus();
      await user.keyboard('{Enter}');

      expect(document.documentElement.getAttribute('data-theme')).toBe('light');
    });

    it('responds to Space key', async () => {
      mockStorage.set(STORAGE_KEY, 'dark');
      const user = userEvent.setup();
      render(<ThemeToggle />);

      const button = screen.getByRole('button');
      expect(document.documentElement.getAttribute('data-theme')).toBe('dark');

      button.focus();
      await user.keyboard(' ');

      expect(document.documentElement.getAttribute('data-theme')).toBe('light');
    });
  });
});
