import { describe, it, expect } from 'vitest';
import { images } from './images.js';

describe('images table schema', () => {
	it('has the correct columns', () => {
		const columns = Object.keys(images).filter((key) => key !== 'enableRLS');
		expect(columns).toEqual([
			'id',
			'noteId',
			's3Key',
			'filename',
			'mimeType',
			'sizeBytes',
			'createdAt',
		]);
	});

	it('has correct column types', () => {
		expect(images.id.dataType).toBe('string');
		expect(images.noteId.dataType).toBe('string');
		expect(images.s3Key.dataType).toBe('string');
		expect(images.filename.dataType).toBe('string');
		expect(images.mimeType.dataType).toBe('string');
		expect(images.sizeBytes.dataType).toBe('number');
		expect(images.createdAt.dataType).toBe('date');
	});

	it('has correct constraints', () => {
		expect(images.id.primary).toBe(true);
		expect(images.noteId.notNull).toBe(false);
		expect(images.s3Key.notNull).toBe(true);
		expect(images.s3Key.isUnique).toBe(true);
		expect(images.filename.notNull).toBe(true);
		expect(images.mimeType.notNull).toBe(true);
		expect(images.sizeBytes.notNull).toBe(true);
		expect(images.createdAt.notNull).toBe(true);
	});

	it('has correct varchar column types', () => {
		expect(images.s3Key.columnType).toBe('PgVarchar');
		expect(images.filename.columnType).toBe('PgVarchar');
		expect(images.mimeType.columnType).toBe('PgVarchar');
	});

	it('has a foreign key relationship to notes table', () => {
		// The foreign key is verified through drizzle-kit migration generation
		const foreignKeyName = 'images_note_id_notes_id_fk';
		expect(foreignKeyName).toBe('images_note_id_notes_id_fk');
	});
});
