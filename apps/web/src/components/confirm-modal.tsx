import { useEffect, useRef, type KeyboardEvent } from 'react';
import styles from './confirm-modal.module.css';

export type ConfirmModalVariant = 'danger' | 'default';

interface ConfirmModalProps {
  readonly open: boolean;
  readonly title: string;
  readonly message: string;
  readonly confirmLabel?: string;
  readonly cancelLabel?: string;
  readonly variant?: ConfirmModalVariant;
  readonly onConfirm: () => void;
  readonly onCancel: () => void;
}

export function ConfirmModal({
  open,
  title,
  message,
  confirmLabel = 'Delete',
  cancelLabel = 'Cancel',
  variant = 'danger',
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  const cancelButtonRef = useRef<HTMLButtonElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      cancelButtonRef.current?.focus();
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>): void => {
    if (e.key === 'Escape') {
      onCancel();
    }
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>): void => {
    if (e.target === e.currentTarget) {
      onCancel();
    }
  };

  if (!open) {
    return null;
  }

  return (
    <div
      className={styles.backdrop}
      onClick={handleBackdropClick}
      onKeyDown={handleKeyDown}
      role="dialog"
      aria-modal="true"
      aria-labelledby={styles.titleId}
      aria-describedby={styles.messageId}
    >
      <div
        className={`${styles.modal} ${styles.open}`}
        ref={modalRef}
        role="presentation"
      >
        <h2 id={styles.titleId} className={styles.title}>
          {title}
        </h2>
        <p id={styles.messageId} className={styles.message}>
          {message}
        </p>
        <div className={styles.buttonRow}>
          <button
            type="button"
            ref={cancelButtonRef}
            className={styles.cancelButton}
            onClick={onCancel}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            className={`${styles.confirmButton} ${styles[variant]}`}
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
