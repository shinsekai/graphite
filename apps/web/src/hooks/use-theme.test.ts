import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, cleanup } from '@testing-library/react';
import { useTheme } from './use-theme';

const STORAGE_KEY = 'graphite-theme';

describe('useTheme', () => {
  beforeEach(() => {
    // Mock localStorage with simple in-memory implementation
    const mockStorage = new Map<string, string>();
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

  describe('theme defaults', () => {
    it('defaults to dark theme when no theme is stored', () => {
      const { result } = renderHook(() => useTheme());

      expect(result.current.theme).toBe('dark');
      expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    });

    it('defaults to dark theme when invalid theme is stored', () => {
      localStorage.setItem(STORAGE_KEY, 'invalid');
      const { result } = renderHook(() => useTheme());

      expect(result.current.theme).toBe('dark');
      expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    });
  });

  describe('theme persistence', () => {
    it('reads light theme from localStorage', () => {
      localStorage.setItem(STORAGE_KEY, 'light');
      const { result } = renderHook(() => useTheme());

      expect(result.current.theme).toBe('light');
      expect(document.documentElement.getAttribute('data-theme')).toBe('light');
    });

    it('reads dark theme from localStorage', () => {
      localStorage.setItem(STORAGE_KEY, 'dark');
      const { result } = renderHook(() => useTheme());

      expect(result.current.theme).toBe('dark');
      expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    });

    it('persists theme toggle to localStorage', () => {
      const { result } = renderHook(() => useTheme());

      result.current.toggleTheme();

      expect(localStorage.getItem(STORAGE_KEY)).toBe('light');
      expect(document.documentElement.getAttribute('data-theme')).toBe('light');
    });

    it('persists explicit theme set to localStorage', () => {
      const { result } = renderHook(() => useTheme());

      result.current.setTheme('light');

      expect(localStorage.getItem(STORAGE_KEY)).toBe('light');
      expect(document.documentElement.getAttribute('data-theme')).toBe('light');
    });
  });

  describe('theme toggle', () => {
    it('toggles from dark to light', () => {
      localStorage.setItem(STORAGE_KEY, 'dark');
      const { result } = renderHook(() => useTheme());

      expect(result.current.theme).toBe('dark');

      result.current.toggleTheme();

      expect(result.current.theme).toBe('dark'); // Next render will show light
      expect(document.documentElement.getAttribute('data-theme')).toBe('light');
    });

    it('toggles from light to dark', () => {
      localStorage.setItem(STORAGE_KEY, 'light');
      const { result } = renderHook(() => useTheme());

      expect(result.current.theme).toBe('light');

      result.current.toggleTheme();

      expect(result.current.theme).toBe('light'); // Next render will show dark
      expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    });

    it('updates data-theme attribute on toggle', () => {
      const { result } = renderHook(() => useTheme());

      expect(document.documentElement.getAttribute('data-theme')).toBe('dark');

      result.current.toggleTheme();

      expect(document.documentElement.getAttribute('data-theme')).toBe('light');
    });
  });

  describe('setTheme', () => {
    it('sets light theme explicitly', () => {
      const { result } = renderHook(() => useTheme());

      result.current.setTheme('light');

      expect(localStorage.getItem(STORAGE_KEY)).toBe('light');
      expect(document.documentElement.getAttribute('data-theme')).toBe('light');
    });

    it('sets dark theme explicitly', () => {
      localStorage.setItem(STORAGE_KEY, 'light');
      const { result } = renderHook(() => useTheme());

      result.current.setTheme('dark');

      expect(localStorage.getItem(STORAGE_KEY)).toBe('dark');
      expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    });

    it('updates data-theme attribute on setTheme', () => {
      const { result } = renderHook(() => useTheme());

      result.current.setTheme('light');

      expect(document.documentElement.getAttribute('data-theme')).toBe('light');

      result.current.setTheme('dark');

      expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    });
  });
});
