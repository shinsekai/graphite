import { useState } from 'react';
import { Sidebar } from '../components/sidebar';
import { NoteEditor } from '../editor/note-editor';
import { useNote } from '../hooks/use-notes';
import styles from './main-layout.module.css';

export function MainLayout() {
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);

  const { data: note, isLoading } = useNote(activeNoteId ?? '');

  const handleSelectNote = (id: string): void => {
    setActiveNoteId(id);
  };

  return (
    <div className={styles.container}>
      <Sidebar activeNoteId={activeNoteId} onSelectNote={handleSelectNote} />
      <main className={styles.main}>
        {isLoading ? (
          <p className={styles.placeholder}>Loading...</p>
        ) : (
          <NoteEditor note={note ?? null} />
        )}
      </main>
    </div>
  );
}
