import { useState } from 'react';
import { useDebounce } from '../hooks/use-debounce';
import { useNotes, useSearchNotes, useCreateNote, useDeleteNote } from '../hooks/use-notes';
import { SearchInput } from './search-input';
import { NoteListItem } from './note-list-item';
import { Plus } from 'lucide-react';
import styles from './sidebar.module.css';

interface SidebarProps {
  readonly activeNoteId: string | null;
  readonly onSelectNote: (id: string) => void;
}

export function Sidebar({ activeNoteId, onSelectNote }: SidebarProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedQuery = useDebounce(searchQuery, 300);

  const { data: notes = [], isLoading } = useNotes();
  const { data: searchResults = [], isLoading: isSearching } =
    useSearchNotes(debouncedQuery);
  const createNote = useCreateNote();
  const deleteNote = useDeleteNote();

  const displayNotes: NoteSummary[] = debouncedQuery.length > 0 ? searchResults : notes;

  const sortedNotes = [...displayNotes].sort((a, b) => {
    if (a.pinned !== b.pinned) {
      return a.pinned ? -1 : 1;
    }
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
  });

  const handleCreateNote = (): void => {
    createNote.mutate(
      { title: '', content: {} },
      {
        onSuccess: (note) => {
          onSelectNote(note.id);
        },
      },
    );
  };

  const handleClearSearch = (): void => {
    setSearchQuery('');
  };

  const handleDeleteNote = (id: string): void => {
    if (window.confirm('Are you sure you want to delete this note?')) {
      deleteNote.mutate(id);
      if (activeNoteId === id) {
        onSelectNote('');
      }
    }
  };

  const handleSearchChange = (value: string): void => {
    setSearchQuery(value);
  };

  return (
    <aside className={styles.sidebar}>
      <header className={styles.header}>
        <h1 className={styles.heading}>Graphite</h1>
        <button
          type="button"
          className={styles.newNoteButton}
          onClick={handleCreateNote}
          aria-label="New note"
        >
          <Plus size={16} />
          <span className={styles.newNoteText}>New note</span>
        </button>
      </header>
      <div className={styles.searchContainer}>
        <SearchInput
          value={searchQuery}
          onChange={handleSearchChange}
          onClear={handleClearSearch}
        />
      </div>
      <div className={styles.noteList}>
        {isLoading || isSearching ? (
          <div className={styles.loading}>Loading...</div>
        ) : sortedNotes.length === 0 ? (
          <div className={styles.empty}>
            {debouncedQuery.length > 0
              ? 'No notes found'
              : 'No notes yet. Create one!'}
          </div>
        ) : (
          sortedNotes.map((note) => (
            <NoteListItem
              key={note.id}
              note={note}
              isActive={note.id === activeNoteId}
              onClick={onSelectNote}
              onDelete={handleDeleteNote}
            />
          ))
        )}
      </div>
    </aside>
  );
}
