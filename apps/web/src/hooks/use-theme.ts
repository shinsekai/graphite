import { useCallback, useEffect } from 'react';

type Theme = 'dark' | 'light';

const THEME_STORAGE_KEY = 'graphite-theme';
const DEFAULT_THEME: Theme = 'dark';

function getStoredTheme(): Theme {
  if (typeof window === 'undefined') {
    return DEFAULT_THEME;
  }

  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    return stored === 'light' || stored === 'dark' ? stored : DEFAULT_THEME;
  } catch {
    return DEFAULT_THEME;
  }
}

function setStoredTheme(theme: Theme): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // Silent fail if localStorage is unavailable
  }
}

function applyTheme(theme: Theme): void {
  if (typeof document === 'undefined') {
    return;
  }

  document.documentElement.setAttribute('data-theme', theme);
}

/**
 * Hook for managing the application theme.
 *
 * The theme defaults to dark, persists to localStorage, and
 * sets the `data-theme` attribute on the document element.
 *
 * @returns Current theme and toggle function
 */
export function useTheme(): {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
} {
  const theme = getStoredTheme();

  // Apply theme on mount
  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    const newTheme: Theme = theme === 'dark' ? 'light' : 'dark';
    setStoredTheme(newTheme);
    applyTheme(newTheme);
  }, [theme]);

  const setTheme = useCallback((newTheme: Theme) => {
    setStoredTheme(newTheme);
    applyTheme(newTheme);
  }, []);

  return { theme, toggleTheme, setTheme };
}
