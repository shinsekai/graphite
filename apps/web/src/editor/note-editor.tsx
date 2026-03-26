import { useEffect, useState, useCallback } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import { useDebounce } from '../hooks/use-debounce';
import { useUpdateNote } from '../hooks/use-notes';
import { getExtensions } from './extensions';
import { FloatingToolbar } from './floating-toolbar';
import { EditorToolbar } from './editor-toolbar';
import styles from './note-editor.module.css';

const AUTOSAVE_DEBOUNCE_MS = 1500;

interface NoteEditorProps {
  readonly note: {
    readonly id: string;
    readonly title: string;
    readonly content: unknown;
  } | null;
}

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

export function NoteEditor({ note }: NoteEditorProps) {
  const [title, setTitle] = useState('');
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const updateNote = useUpdateNote();
  const [isDirty, setIsDirty] = useState(false);

  const debouncedTitle = useDebounce(title, AUTOSAVE_DEBOUNCE_MS);

  const editor = useEditor({
    extensions: getExtensions(),
    content: typeof note?.content === 'object' && note?.content !== null
      ? note.content
      : { type: 'doc', content: [] },
    editable: !!note,
    onUpdate: ({ editor: e }) => {
      setIsDirty(true);
      setSaveStatus('idle');
    },
    editorProps: {
      attributes: {
        class: styles.editorContent,
      },
    },
  });

  useEffect(() => {
    if (note) {
      setTitle(note.title);
      setSaveStatus('idle');
      setIsDirty(false);
    } else {
      setTitle('');
      setSaveStatus('idle');
      setIsDirty(false);
    }
  }, [note?.id, note?.title]);

  useEffect(() => {
    if (!note) {
      return;
    }

    if (!isDirty) {
      return;
    }

    const content = editor?.getJSON();

    const performSave = async (): Promise<void> => {
      setSaveStatus('saving');

      try {
        await updateNote.mutateAsync({
          id: note.id,
          data: {
            title: debouncedTitle,
            content,
          },
        });
        setSaveStatus('saved');
        setIsDirty(false);
      } catch {
        setSaveStatus('error');
      }
    };

    const timer = setTimeout(performSave, AUTOSAVE_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [debouncedTitle, note, editor, isDirty, updateNote]);

  const handleRetry = useCallback(() => {
    if (!note) {
      return;
    }

    const content = editor?.getJSON();

    setSaveStatus('saving');
    updateNote.mutate(
      {
        id: note.id,
        data: {
          title,
          content,
        },
      },
      {
        onSuccess: () => {
          setSaveStatus('saved');
          setIsDirty(false);
        },
        onError: () => {
          setSaveStatus('error');
        },
      },
    );
  }, [note, editor, title, updateNote]);

  if (!note) {
    return (
      <div className={styles.empty}>
        <p>Select a note to start editing...</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <input
          type="text"
          className={styles.titleInput}
          placeholder="Untitled note"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            setIsDirty(true);
            setSaveStatus('idle');
          }}
        />
        <div className={styles.status}>
          {saveStatus === 'saving' && <span className={styles.saving}>Saving...</span>}
          {saveStatus === 'saved' && <span className={styles.saved}>Saved</span>}
          {saveStatus === 'error' && (
            <button
              type="button"
              className={styles.retry}
              onClick={handleRetry}
            >
              Error — retry
            </button>
          )}
        </div>
      </div>
      <div className={styles.toolbarContainer}>
        <EditorToolbar editor={editor} />
      </div>
      <div className={styles.editorWrapper}>
        <EditorContent editor={editor} />
      </div>
      <FloatingToolbar editor={editor} />
    </div>
  );
}
