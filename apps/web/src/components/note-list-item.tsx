import { type MouseEvent } from 'react';
import { Pin } from 'lucide-react';
import { formatDate } from '../utils/format-date';
import type { NoteSummary } from '@graphite/shared';
import styles from './note-list-item.module.css';

interface NoteListItemProps {
  readonly note: NoteSummary;
  readonly isActive?: boolean;
  readonly onClick: (id: string) => void;
  readonly onDelete?: (id: string) => void;
}

export function NoteListItem({
  note,
  isActive = false,
  onClick,
  onDelete,
}: NoteListItemProps) {
  const handleClick = (): void => {
    onClick(note.id);
  };

  const handleContextMenu = (e: MouseEvent<HTMLDivElement>): void => {
    e.preventDefault();
    if (onDelete) {
      onDelete(note.id);
    }
  };

  const title = note.title || 'Untitled';
  const preview = note.preview || 'No content';

  return (
    <div
      className={`${styles.item} ${isActive ? styles.active : ''} ${note.pinned ? styles.pinned : ''}`}
      onClick={handleClick}
      onContextMenu={handleContextMenu}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      }}
    >
      <div className={styles.header}>
        <h3 className={styles.title}>{title}</h3>
        {note.pinned && <Pin size={14} className={styles.pinIcon} />}
      </div>
      <p className={styles.preview}>{preview}</p>
      <span className={styles.timestamp}>{formatDate(note.updatedAt)}</span>
    </div>
  );
}
