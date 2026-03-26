import type { DrizzleDB } from '@graphite/db';
import { notes } from '@graphite/db';
import type { CreateNote, Note, NoteSummary, UpdateNote } from '@graphite/shared';
import { NOTE_PREVIEW_LENGTH } from '@graphite/shared';
import { desc, eq, sql } from 'drizzle-orm';
import type { UploadsService } from './uploads';

export class NotesService {
  constructor(
    private readonly db: DrizzleDB,
    private readonly uploadsService?: UploadsService,
  ) {}

  async list(): Promise<NoteSummary[]> {
    const result = await this.db
      .select({
        id: notes.id,
        title: notes.title,
        plaintext: notes.plaintext,
        pinned: notes.pinned,
        updatedAt: notes.updatedAt,
      })
      .from(notes)
      .orderBy(desc(notes.pinned), desc(notes.updatedAt));

    return result.map(note => ({
      id: note.id,
      title: note.title,
      preview: note.plaintext.slice(0, NOTE_PREVIEW_LENGTH),
      pinned: note.pinned,
      updatedAt: note.updatedAt.toISOString(),
    }));
  }

  async getById(id: string): Promise<Note | null> {
    const result = await this.db.select().from(notes).where(eq(notes.id, id)).limit(1);

    if (result.length === 0) {
      return null;
    }

    const note = result[0];
    return {
      id: note.id,
      title: note.title,
      content: note.content as unknown as Note['content'],
      plaintext: note.plaintext,
      pinned: note.pinned,
      createdAt: note.createdAt.toISOString(),
      updatedAt: note.updatedAt.toISOString(),
    };
  }

  async create(data: CreateNote): Promise<Note> {
    const now = new Date();
    const newNote = {
      title: data.title ?? '',
      content: data.content ?? {},
      plaintext: '',
      pinned: false,
      createdAt: now,
      updatedAt: now,
    };

    const result = await this.db.insert(notes).values(newNote).returning();

    const note = result[0];
    return {
      id: note.id,
      title: note.title,
      content: note.content as unknown as Note['content'],
      plaintext: note.plaintext,
      pinned: note.pinned,
      createdAt: note.createdAt.toISOString(),
      updatedAt: note.updatedAt.toISOString(),
    };
  }

  async update(id: string, data: UpdateNote): Promise<Note | null> {
    const now = new Date();
    const updateData: Record<string, unknown> = {
      updatedAt: now,
    };

    if (data.title !== undefined) {
      updateData.title = data.title;
    }
    if (data.content !== undefined) {
      updateData.content = data.content;
    }
    if (data.plaintext !== undefined) {
      updateData.plaintext = data.plaintext;
    }
    if (data.pinned !== undefined) {
      updateData.pinned = data.pinned;
    }

    const result = await this.db.update(notes).set(updateData).where(eq(notes.id, id)).returning();

    if (result.length === 0) {
      return null;
    }

    const note = result[0];
    return {
      id: note.id,
      title: note.title,
      content: note.content as unknown as Note['content'],
      plaintext: note.plaintext,
      pinned: note.pinned,
      createdAt: note.createdAt.toISOString(),
      updatedAt: note.updatedAt.toISOString(),
    };
  }

  async remove(id: string): Promise<{ id: string } | null> {
    const result = await this.db.delete(notes).where(eq(notes.id, id)).returning({ id: notes.id });

    if (result.length === 0) {
      return null;
    }

    // Clean up images associated with the note
    if (this.uploadsService) {
      await this.uploadsService.removeByNoteId(id);
    }

    return result[0];
  }

  async search(query: string): Promise<NoteSummary[]> {
    const tsquery = sql`plainto_tsquery('english', ${query})`;
    const tsvector = sql`to_tsvector('english', ${notes.plaintext} || ' ' || ${notes.title})`;
    const rank = sql<number>`ts_rank(${tsvector}, ${tsquery})`;

    const result = await this.db
      .select({
        id: notes.id,
        title: notes.title,
        plaintext: notes.plaintext,
        pinned: notes.pinned,
        updatedAt: notes.updatedAt,
      })
      .from(notes)
      .where(sql`${tsvector} @@ ${tsquery}`)
      .orderBy(desc(rank), desc(notes.updatedAt));

    return result.map(note => ({
      id: note.id,
      title: note.title,
      preview: note.plaintext.slice(0, NOTE_PREVIEW_LENGTH),
      pinned: note.pinned,
      updatedAt: note.updatedAt.toISOString(),
    }));
  }
}

export function createNotesService(db: DrizzleDB, uploadsService?: UploadsService): NotesService {
  return new NotesService(db, uploadsService);
}
