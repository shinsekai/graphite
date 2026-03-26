import { useState } from 'react';
import { useDebounce } from '../hooks/use-debounce';
import { useNotes, useSearchNotes, useCreateNote, useDeleteNote } from '../hooks/use-notes';
import { SearchInput } from './search-input';
import { NoteListItem } from './note-list-item';
import { ConfirmModal } from './confirm-modal';
import { Plus, Menu, X } from 'lucide-react';
import styles from './sidebar.module.css';

interface SidebarProps {
  readonly activeNoteId: string | null;
  readonly onSelectNote: (id: string) => void;
  readonly isOpen?: boolean;
  readonly onClose?: () => void;
  readonly isMobile?: boolean;
}

export function Sidebar({
  activeNoteId,
  onSelectNote,
  isOpen = false,
  onClose,
  isMobile = false,
}: SidebarProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
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
    setDeleteTarget(id);
  };

  const handleConfirmDelete = (): void => {
    if (deleteTarget) {
      deleteNote.mutate(deleteTarget);
      if (activeNoteId === deleteTarget) {
        onSelectNote('');
      }
    }
    setDeleteTarget(null);
  };

  const handleCancelDelete = (): void => {
    setDeleteTarget(null);
  };

  const handleSearchChange = (value: string): void => {
    setSearchQuery(value);
  };

  return (
    <>
      <button
        type="button"
        className={styles.hamburgerButton}
        onClick={() => {
          if (isMobile && onClose) {
            onClose();
          }
        }}
        aria-label={isMobile && isOpen ? 'Close sidebar' : 'Open sidebar'}
      >
        {isMobile && isOpen ? <X size={20} /> : <Menu size={20} />}
      </button>
      <aside
        className={`${styles.sidebar} ${isMobile ? (isOpen ? styles.mobileOpen : styles.mobileClosed) : ''}`}
      >
        <header className={styles.header}>
          <h1 className={styles.heading}>Graphite</h1>
          <button
            type="button"
            className={styles.newNoteButton}
            onClick={handleCreateNote}
            aria-label="New note"
          >
            <Plus size={16} className={styles.icon} />
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
      {isMobile && isOpen && (
        <div
          className={`${styles.overlay} ${styles.visible}`}
          onClick={onClose}
          role="presentation"
        />
      )}
      <ConfirmModal
        open={deleteTarget !== null}
        title="Delete note"
        message="This note will be permanently deleted. This action cannot be undone."
        confirmLabel="Delete"
        variant="danger"
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
    </>
  );
}
