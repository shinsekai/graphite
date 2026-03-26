import { useState } from 'react';
import { Sidebar } from '../components/sidebar';
import styles from './main-layout.module.css';

export function MainLayout() {
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);

  const handleSelectNote = (id: string): void => {
    setActiveNoteId(id);
  };

  return (
    <div className={styles.container}>
      <Sidebar activeNoteId={activeNoteId} onSelectNote={handleSelectNote} />
      <main className={styles.main}>
        {activeNoteId ? (
          <p>Note editor for {activeNoteId}</p>
        ) : (
          <p className={styles.placeholder}>Select a note to start editing...</p>
        )}
      </main>
    </div>
  );
}
