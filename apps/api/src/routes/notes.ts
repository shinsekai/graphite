import { Hono } from 'hono';
import { validator } from 'hono/validator';
import type { AppDeps } from '../app';
import type { DrizzleDB } from '@graphite/db';
import {
	createNoteSchema,
	updateNoteSchema,
	searchQuerySchema,
	noteSummarySchema,
	noteSchema,
} from '@graphite/shared';
import { createNotesService } from '../services/notes';
import { createUploadsService } from '../services/uploads';
import { HTTPException } from 'hono/http-exception';

export function createNotesRoutes(deps: AppDeps): Hono {
	const app = new Hono();
	const uploadsService = createUploadsService(deps.db as DrizzleDB, deps.s3);
	const notesService = createNotesService(deps.db as DrizzleDB, uploadsService);

	// Search route must come before /:id to avoid param capture
	app.get(
		'/search',
		validator('query', (value, c) => {
			const result = searchQuerySchema.safeParse(value);
			if (!result.success) {
				throw new HTTPException(400, {
					message: 'Invalid query parameters',
				});
			}
			return result.data;
		}),
		async (c) => {
			const { q } = c.req.valid('query');
			const results = await notesService.search(q);
			return c.json({ data: results });
		},
	);

	app.get('/', async (c) => {
		const notesList = await notesService.list();
		return c.json({ data: notesList });
	});

	app.get(
		'/:id',
		validator('param', (value, c) => {
			const result = noteSummarySchema.shape.id.safeParse(value.id);
			if (!result.success) {
				throw new HTTPException(400, {
					message: 'Invalid UUID format',
				});
			}
			return { id: value.id };
		}),
		async (c) => {
			const { id } = c.req.valid('param');
			const note = await notesService.getById(id);

			if (!note) {
				throw new HTTPException(404, {
					message: 'Note not found',
				});
			}

			return c.json({ data: note });
		},
	);

	app.post(
		'/',
		validator('json', (value, c) => {
			const result = createNoteSchema.safeParse(value);
			if (!result.success) {
				throw new HTTPException(400, {
					message: 'Invalid request body',
				});
			}
			return result.data;
		}),
		async (c) => {
			const data = c.req.valid('json');
			const note = await notesService.create(data);
			return c.json({ data: note }, 201);
		},
	);

	app.put(
		'/:id',
		validator('param', (value, c) => {
			const result = noteSummarySchema.shape.id.safeParse(value.id);
			if (!result.success) {
				throw new HTTPException(400, {
					message: 'Invalid UUID format',
				});
			}
			return { id: value.id };
		}),
		validator('json', (value, c) => {
			const result = updateNoteSchema.safeParse(value);
			if (!result.success) {
				throw new HTTPException(400, {
					message: 'Invalid request body',
				});
			}
			return result.data;
		}),
		async (c) => {
			const { id } = c.req.valid('param');
			const data = c.req.valid('json');
			const note = await notesService.update(id, data);

			if (!note) {
				throw new HTTPException(404, {
					message: 'Note not found',
				});
			}

			return c.json({ data: note });
		},
	);

	app.delete(
		'/:id',
		validator('param', (value, c) => {
			const result = noteSummarySchema.shape.id.safeParse(value.id);
			if (!result.success) {
				throw new HTTPException(400, {
					message: 'Invalid UUID format',
				});
			}
			return { id: value.id };
		}),
		async (c) => {
			const { id } = c.req.valid('param');
			const result = await notesService.remove(id);

			if (!result) {
				throw new HTTPException(404, {
					message: 'Note not found',
				});
			}

			return c.json({ data: result });
		},
	);

	return app;
}
