import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { setAuthToken, validateToken } from '@/lib/api-client';
import styles from './auth-page.module.css';

export function AuthPage() {
  const navigate = useNavigate();
  const [token, setToken] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const isValid = await validateToken(token.trim());

      if (isValid) {
        setAuthToken(token.trim());
        navigate('/');
      } else {
        setError('Invalid token. Please try again.');
      }
    } catch {
      setError('Failed to validate token. Please check your connection.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.heading}>Graphite</h1>
        <p className={styles.subheading}>Enter your authentication token</p>
        <form onSubmit={handleSubmit} className={styles.form}>
          <input
            type="password"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="Authentication token"
            className={styles.input}
            disabled={isLoading}
            autoFocus
          />
          {error && <p className={styles.error}>{error}</p>}
          <button type="submit" className={styles.button} disabled={isLoading || !token.trim()}>
            {isLoading ? 'Validating...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}
