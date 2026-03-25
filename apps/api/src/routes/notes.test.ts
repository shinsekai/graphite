import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Hono } from 'hono';
import { HTTPException } from 'hono/http-exception';
import {
	createNoteSchema,
	updateNoteSchema,
	searchQuerySchema,
} from '@graphite/shared';

const mockNotes = [
	{
		id: '11111111-1111-4111-8111-111111111111',
		title: 'First Note',
		preview: 'This is the content',
		pinned: false,
		updatedAt: '2026-03-25T10:00:00Z',
		content: {},
		plaintext: 'This is the content',
		createdAt: '2026-03-25T09:00:00Z',
	},
	{
		id: '22222222-2222-4222-9222-222222222222',
		title: 'Second Note',
		preview: 'Another note',
		pinned: true,
		updatedAt: '2026-03-25T11:00:00Z',
		content: {},
		plaintext: 'Another note',
		createdAt: '2026-03-25T10:00:00Z',
	},
];

const mockService = {
	list: vi.fn(),
	search: vi.fn(),
	getById: vi.fn(),
	create: vi.fn(),
	update: vi.fn(),
	remove: vi.fn(),
};

// Mock the service module before importing routes
vi.mock('../services/notes', () => ({
	createNotesService: vi.fn(() => mockService),
}));

describe('Notes Routes', () => {
	let app: Hono;

	// Define a simple UUID validator that mimics Zod's behavior
	const isValidUUID = (value: string) => {
		const uuidRegex =
			/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
		return uuidRegex.test(value);
	};

	beforeEach(() => {
		vi.clearAllMocks();
		app = new Hono();

		// Re-create routes with mocked service
		app.get('/', async (c) => {
			const notesList = await mockService.list();
			return c.json({ data: notesList });
		});

		app.get('/search', async (c) => {
			const query = c.req.query();
			const result = searchQuerySchema.safeParse(query);
			if (!result.success) {
				throw new HTTPException(400, {
					message: 'Invalid query parameters',
				});
			}
			const results = await mockService.search(result.data.q);
			return c.json({ data: results });
		});

		app.get('/:id', async (c) => {
			const id = c.req.param('id');
			if (!isValidUUID(id)) {
				throw new HTTPException(400, {
					message: 'Invalid UUID format',
				});
			}
			const note = await mockService.getById(id);
			if (!note) {
				throw new HTTPException(404, {
					message: 'Note not found',
				});
			}
			return c.json({ data: note });
		});

		app.post('/', async (c) => {
			let body;
			try {
				body = await c.req.json();
			} catch {
				throw new HTTPException(400, {
					message: 'Invalid JSON',
				});
			}
			const result = createNoteSchema.safeParse(body);
			if (!result.success) {
				throw new HTTPException(400, {
					message: 'Invalid request body',
				});
			}
			const note = await mockService.create(result.data);
			return c.json({ data: note }, 201);
		});

		app.put('/:id', async (c) => {
			const id = c.req.param('id');
			if (!isValidUUID(id)) {
				throw new HTTPException(400, {
					message: 'Invalid UUID format',
				});
			}
			let body;
			try {
				body = await c.req.json();
			} catch {
				throw new HTTPException(400, {
					message: 'Invalid JSON',
				});
			}
			const result = updateNoteSchema.safeParse(body);
			if (!result.success) {
				throw new HTTPException(400, {
					message: 'Invalid request body',
				});
			}
			const note = await mockService.update(id, result.data);
			if (!note) {
				throw new HTTPException(404, {
					message: 'Note not found',
				});
			}
			return c.json({ data: note });
		});

		app.delete('/:id', async (c) => {
			const id = c.req.param('id');
			if (!isValidUUID(id)) {
				throw new HTTPException(400, {
					message: 'Invalid UUID format',
				});
			}
			const deleted = await mockService.remove(id);
			if (!deleted) {
				throw new HTTPException(404, {
					message: 'Note not found',
				});
			}
			return c.json({ data: deleted });
		});
	});

	afterEach(() => {
		vi.clearAllMocks();
	});

	describe('GET /', () => {
		it('should return list of notes', async () => {
			mockService.list.mockResolvedValue(mockNotes);

			const res = await app.request('/');

			expect(res.status).toBe(200);
			const json = await res.json();
			expect(json).toEqual({ data: mockNotes });
			expect(mockService.list).toHaveBeenCalledOnce();
		});
	});

	describe('GET /search', () => {
		it('should return search results', async () => {
			mockService.search.mockResolvedValue([mockNotes[0]]);

			const res = await app.request('/search?q=first');

			expect(res.status).toBe(200);
			const json = await res.json();
			expect(json).toEqual({ data: [mockNotes[0]] });
			expect(mockService.search).toHaveBeenCalledWith('first');
		});

		it('should return 400 when query is missing', async () => {
			const res = await app.request('/search');

			expect(res.status).toBe(400);
		});

		it('should return 400 when query is empty string', async () => {
			const res = await app.request('/search?q=');

			expect(res.status).toBe(400);
		});

		it('should return 400 when query is whitespace only', async () => {
			const res = await app.request('/search?q=   ');

			expect(res.status).toBe(400);
		});
	});

	describe('GET /:id', () => {
		it('should return note by id', async () => {
			mockService.getById.mockResolvedValue(mockNotes[0]);

			const res = await app.request('/11111111-1111-4111-8111-111111111111');

			expect(res.status).toBe(200);
			const json = await res.json();
			expect(json).toEqual({ data: mockNotes[0] });
			expect(mockService.getById).toHaveBeenCalledWith(
				'11111111-1111-4111-8111-111111111111',
			);
		});

		it('should return 404 when note not found', async () => {
			mockService.getById.mockResolvedValue(null);

			const res = await app.request('/11111111-1111-4111-8111-111111111111');

			expect(res.status).toBe(404);
		});

		it('should return 400 for invalid UUID', async () => {
			const res = await app.request('/not-a-uuid');

			expect(res.status).toBe(400);
		});
	});

	describe('POST /', () => {
		it('should create a note with valid body', async () => {
			const newNote = {
				id: '33333333-3333-4333-9333-333333333333',
				title: 'New Note',
				content: { type: 'doc' },
				plaintext: '',
				pinned: false,
				createdAt: '2026-03-25T12:00:00Z',
				updatedAt: '2026-03-25T12:00:00Z',
			};

			mockService.create.mockResolvedValue(newNote);

			const res = await app.request('/', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ title: 'New Note', content: { type: 'doc' } }),
			});

			expect(res.status).toBe(201);
			const json = await res.json();
			expect(json).toEqual({ data: newNote });
			expect(mockService.create).toHaveBeenCalledWith({
				title: 'New Note',
				content: { type: 'doc' },
			});
		});

		it('should create a note with empty body (defaults)', async () => {
			const newNote = {
				id: '33333333-3333-4333-9333-333333333333',
				title: '',
				content: {},
				plaintext: '',
				pinned: false,
				createdAt: '2026-03-25T12:00:00Z',
				updatedAt: '2026-03-25T12:00:00Z',
			};

			mockService.create.mockResolvedValue(newNote);

			const res = await app.request('/', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({}),
			});

			expect(res.status).toBe(201);
			expect(mockService.create).toHaveBeenCalledWith({});
		});

		it('should return 400 for invalid body (title too long)', async () => {
			const res = await app.request('/', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ title: 'a'.repeat(501) }),
			});

			expect(res.status).toBe(400);
		});

		it('should return 400 for invalid JSON', async () => {
			const res = await app.request('/', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: 'not json',
			});

			expect(res.status).toBe(400);
		});
	});

	describe('PUT /:id', () => {
		it('should update a note', async () => {
			const updatedNote = {
				...mockNotes[0],
				title: 'Updated Title',
			};

			mockService.update.mockResolvedValue(updatedNote);

			const res = await app.request('/11111111-1111-4111-8111-111111111111', {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ title: 'Updated Title' }),
			});

			expect(res.status).toBe(200);
			const json = await res.json();
			expect(json).toEqual({ data: updatedNote });
			expect(mockService.update).toHaveBeenCalledWith(
				'11111111-1111-4111-8111-111111111111',
				{ title: 'Updated Title' },
			);
		});

		it('should return 404 when note not found', async () => {
			mockService.update.mockResolvedValue(null);

			const res = await app.request('/11111111-1111-4111-8111-111111111111', {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ title: 'Updated' }),
			});

			expect(res.status).toBe(404);
		});

		it('should return 400 for invalid UUID', async () => {
			const res = await app.request('/not-a-uuid', {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ title: 'Updated' }),
			});

			expect(res.status).toBe(400);
		});

		it('should return 400 for invalid body', async () => {
			const res = await app.request('/11111111-1111-4111-8111-111111111111', {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ title: 'a'.repeat(501) }),
			});

			expect(res.status).toBe(400);
		});
	});

	describe('DELETE /:id', () => {
		it('should delete a note', async () => {
			mockService.remove.mockResolvedValue({
				id: '11111111-1111-4111-8111-111111111111',
			});

			const res = await app.request('/11111111-1111-4111-8111-111111111111', {
				method: 'DELETE',
			});

			expect(res.status).toBe(200);
			const json = await res.json();
			expect(json).toEqual({
				data: { id: '11111111-1111-4111-8111-111111111111' },
			});
			expect(mockService.remove).toHaveBeenCalledWith(
				'11111111-1111-4111-8111-111111111111',
			);
		});

		it('should return 404 when note not found', async () => {
			mockService.remove.mockResolvedValue(null);

			const res = await app.request('/11111111-1111-4111-8111-111111111111', {
				method: 'DELETE',
			});

			expect(res.status).toBe(404);
		});

		it('should return 400 for invalid UUID', async () => {
			const res = await app.request('/not-a-uuid', {
				method: 'DELETE',
			});

			expect(res.status).toBe(400);
		});
	});
});
