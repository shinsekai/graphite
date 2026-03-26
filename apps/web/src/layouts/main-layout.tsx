import styles from './main-layout.module.css';

export function MainLayout() {
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.heading}>Graphite</h1>
      </header>
      <main className={styles.main}>
        <p className={styles.placeholder}>Note editor coming soon...</p>
      </main>
    </div>
  );
}
