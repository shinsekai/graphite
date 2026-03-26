import { Sun, Moon } from 'lucide-react';
import { useTheme } from '@/hooks/use-theme';
import styles from './theme-toggle.module.css';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      className={styles.themeToggle}
      onClick={toggleTheme}
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
    >
      {theme === 'dark' ? (
        <Sun className={styles.icon} aria-hidden="true" />
      ) : (
        <Moon className={styles.icon} aria-hidden="true" />
      )}
    </button>
  );
}
