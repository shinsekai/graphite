import { Hono } from 'hono';
import { HTTPException } from 'hono/http-exception';
import type { AppDeps } from '../app';
import type { DrizzleDB } from '@graphite/db';
import { createUploadsService } from '../services/uploads';

export function createUploadsRoutes(deps: AppDeps): Hono {
	const app = new Hono();

	app.post('/', async (c) => {
		const formData = await c.req.formData();

		const file = formData.get('file') as File | null;
		const noteId = (formData.get('noteId') as string | null) ?? undefined;

		if (!file) {
			throw new HTTPException(400, {
				message: 'No file provided',
			});
		}

		// Validate file type
		if (file.type === '') {
			throw new HTTPException(400, {
				message: 'Invalid file: no content type detected',
			});
		}

		try {
			const uploadsService = createUploadsService(deps.db as DrizzleDB, deps.s3);
			const result = await uploadsService.upload(file, noteId);
			return c.json({ data: result }, 201);
		} catch (error) {
			if (error instanceof Error) {
				if (error.message.startsWith('Invalid MIME type')) {
					throw new HTTPException(400, { message: error.message });
				}
				if (error.message.startsWith('File size exceeds')) {
					throw new HTTPException(400, { message: error.message });
				}
			}
			throw error;
		}
	});

	app.get('/:id', async (c) => {
		const id = c.req.param('id');

		const uploadsService = createUploadsService(deps.db as DrizzleDB, deps.s3);
		const imageData = await uploadsService.getById(id);

		if (!imageData) {
			throw new HTTPException(404, {
				message: 'Image not found',
			});
		}

		return new Response(imageData.stream, {
			headers: {
				'Content-Type': imageData.mimeType,
				'Cache-Control': 'public, max-age=31536000, immutable',
			},
		});
	});

	return app;
}
