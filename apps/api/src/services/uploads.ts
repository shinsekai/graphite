import { Readable } from 'node:stream';
import type { DrizzleDB } from '@graphite/db';
import { images } from '@graphite/db';
import { ALLOWED_IMAGE_TYPES, IMAGE_MAX_SIZE_BYTES } from '@graphite/shared';
import { eq } from 'drizzle-orm';
import type { S3StorageClient } from '../lib/s3-client';

export interface UploadResult {
  id: string;
  url: string;
}

export interface ImageData {
  stream: ReadableStream;
  mimeType: string;
  filename: string;
}

export class UploadsService {
  constructor(
    private readonly db: DrizzleDB,
    private readonly s3: S3StorageClient,
  ) {}

  async upload(file: File, noteId?: string): Promise<UploadResult> {
    // Validate MIME type
    if (!ALLOWED_IMAGE_TYPES.includes(file.type as (typeof ALLOWED_IMAGE_TYPES)[number])) {
      throw new Error(
        `Invalid MIME type: ${file.type}. Allowed types: ${ALLOWED_IMAGE_TYPES.join(', ')}`,
      );
    }

    // Validate file size
    if (file.size > IMAGE_MAX_SIZE_BYTES) {
      throw new Error(`File size exceeds maximum of ${IMAGE_MAX_SIZE_BYTES} bytes`);
    }

    // Generate S3 key with UUID-based filename
    const ext = this.getExtensionFromMime(file.type);
    const s3Key = `uploads/${crypto.randomUUID()}.${ext}`;

    // Convert File to Buffer
    const buffer = await file.arrayBuffer();

    // Upload to S3
    await this.s3.upload(s3Key, Buffer.from(buffer), file.type);

    // Insert record in database
    const result = await this.db
      .insert(images)
      .values({
        s3Key,
        filename: file.name,
        mimeType: file.type,
        sizeBytes: file.size,
        noteId: noteId ?? null,
      })
      .returning();

    const image = result[0];

    return {
      id: image.id,
      url: `/api/uploads/${image.id}`,
    };
  }

  async getById(id: string): Promise<ImageData | null> {
    const result = await this.db
      .select({
        s3Key: images.s3Key,
        mimeType: images.mimeType,
        filename: images.filename,
      })
      .from(images)
      .where(eq(images.id, id))
      .limit(1);

    if (result.length === 0) {
      return null;
    }

    const { s3Key, mimeType, filename } = result[0];

    const s3Result = await this.s3.get(s3Key);

    if (!s3Result) {
      return null;
    }

    return {
      stream: Readable.toWeb(s3Result.stream),
      mimeType,
      filename,
    };
  }

  async removeByNoteId(noteId: string): Promise<void> {
    // Find all images associated with the note
    const result = await this.db
      .select({ s3Key: images.s3Key, id: images.id })
      .from(images)
      .where(eq(images.noteId, noteId));

    // Delete from S3
    for (const { s3Key } of result) {
      await this.s3.remove(s3Key);
    }

    // Delete from database
    await this.db.delete(images).where(eq(images.noteId, noteId));
  }

  private getExtensionFromMime(mimeType: string): string {
    const mimeToExt: Record<string, string> = {
      'image/jpeg': 'jpg',
      'image/png': 'png',
      'image/gif': 'gif',
      'image/webp': 'webp',
    };

    return mimeToExt[mimeType] ?? 'bin';
  }
}

export function createUploadsService(db: DrizzleDB, s3: S3StorageClient): UploadsService {
  return new UploadsService(db, s3);
}
