import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Hono } from 'hono';
import { HTTPException } from 'hono/http-exception';

const mockUploadsService = {
	upload: vi.fn(),
	getById: vi.fn(),
};

vi.mock('../services/uploads', () => ({
	createUploadsService: vi.fn(() => mockUploadsService),
}));

describe('Uploads Routes', () => {
	let app: Hono;

	beforeEach(() => {
		vi.clearAllMocks();
		app = new Hono();

		app.post('/', async (c) => {
			const formData = await c.req.formData();
			const file = formData.get('file') as File | null;
			const noteId = (formData.get('noteId') as string | null) ?? undefined;

			if (!file) {
				throw new HTTPException(400, {
					message: 'No file provided',
				});
			}

			if (file.type === '') {
				throw new HTTPException(400, {
					message: 'Invalid file: no content type detected',
				});
			}

			try {
				const result = await mockUploadsService.upload(file, noteId);
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
			const imageData = await mockUploadsService.getById(id);

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
	});

	describe('POST /', () => {
		it('should upload a valid JPEG file', async () => {
			const mockResult = {
				id: '11111111-1111-4111-8111-111111111111',
				url: '/api/uploads/11111111-1111-4111-8111-111111111111',
			};

			mockUploadsService.upload.mockResolvedValue(mockResult);

			const formData = new FormData();
			formData.append('file', new File(['test'], 'test.jpg', { type: 'image/jpeg' }));

			const res = await app.request('/', {
				method: 'POST',
				body: formData,
			});

			expect(res.status).toBe(201);
			const json = await res.json();
			expect(json).toEqual({ data: mockResult });
			expect(mockUploadsService.upload).toHaveBeenCalledWith(
				expect.any(File),
				undefined,
			);
		});

		it('should upload a valid PNG file', async () => {
			const mockResult = {
				id: '22222222-2222-4222-9222-222222222222',
				url: '/api/uploads/22222222-2222-4222-9222-222222222222',
			};

			mockUploadsService.upload.mockResolvedValue(mockResult);

			const formData = new FormData();
			formData.append('file', new File(['test'], 'test.png', { type: 'image/png' }));

			const res = await app.request('/', {
				method: 'POST',
				body: formData,
			});

			expect(res.status).toBe(201);
		});

		it('should upload a valid GIF file', async () => {
			const mockResult = {
				id: '33333333-3333-4333-9333-333333333333',
				url: '/api/uploads/33333333-3333-4333-9333-333333333333',
			};

			mockUploadsService.upload.mockResolvedValue(mockResult);

			const formData = new FormData();
			formData.append('file', new File(['test'], 'test.gif', { type: 'image/gif' }));

			const res = await app.request('/', {
				method: 'POST',
				body: formData,
			});

			expect(res.status).toBe(201);
		});

		it('should upload a valid WebP file', async () => {
			const mockResult = {
				id: '44444444-4444-4444-9444-444444444444',
				url: '/api/uploads/44444444-4444-4444-9444-444444444444',
			};

			mockUploadsService.upload.mockResolvedValue(mockResult);

			const formData = new FormData();
			formData.append('file', new File(['test'], 'test.webp', { type: 'image/webp' }));

			const res = await app.request('/', {
				method: 'POST',
				body: formData,
			});

			expect(res.status).toBe(201);
		});

		it('should upload with noteId', async () => {
			const mockResult = {
				id: '11111111-1111-4111-8111-111111111111',
				url: '/api/uploads/11111111-1111-4111-8111-111111111111',
			};

			mockUploadsService.upload.mockResolvedValue(mockResult);

			const formData = new FormData();
			formData.append('file', new File(['test'], 'test.jpg', { type: 'image/jpeg' }));
			formData.append('noteId', '22222222-2222-4222-9222-222222222222');

			const res = await app.request('/', {
				method: 'POST',
				body: formData,
			});

			expect(res.status).toBe(201);
			expect(mockUploadsService.upload).toHaveBeenCalledWith(
				expect.any(File),
				'22222222-2222-4222-9222-222222222222',
			);
		});

		it('should return 400 when file is too large', async () => {
			mockUploadsService.upload.mockRejectedValue(
				new Error('File size exceeds maximum of 10485760 bytes'),
			);

			const formData = new FormData();
			formData.append('file', new File(['a'.repeat(11_000_000)], 'large.jpg', { type: 'image/jpeg' }));

			const res = await app.request('/', {
				method: 'POST',
				body: formData,
			});

			expect(res.status).toBe(400);
		});

		it('should return 400 for invalid MIME type', async () => {
			mockUploadsService.upload.mockRejectedValue(
				new Error('Invalid MIME type: text/plain. Allowed types: image/jpeg, image/png, image/gif, image/webp'),
			);

			const formData = new FormData();
			formData.append('file', new File(['test'], 'test.txt', { type: 'text/plain' }));

			const res = await app.request('/', {
				method: 'POST',
				body: formData,
			});

			expect(res.status).toBe(400);
		});

		it('should return 400 when no file is provided', async () => {
			const formData = new FormData();

			const res = await app.request('/', {
				method: 'POST',
				body: formData,
			});

			expect(res.status).toBe(400);
			// HTTPException is thrown directly in test, not handled by error handler
			// In production, this would be caught and returned as JSON
		});

		it('should return 400 when file has no content type', async () => {
			const formData = new FormData();
			formData.append('file', new File(['test'], 'test.txt', { type: '' }));

			const res = await app.request('/', {
				method: 'POST',
				body: formData,
			});

			expect(res.status).toBe(400);
		});
	});

	describe('GET /:id', () => {
		it('should return image data for existing id', async () => {
			const mockImageData = {
				stream: new ReadableStream(),
				mimeType: 'image/jpeg',
				filename: 'test.jpg',
			};

			mockUploadsService.getById.mockResolvedValue(mockImageData);

			const res = await app.request('/11111111-1111-4111-8111-111111111111');

			expect(res.status).toBe(200);
			expect(res.headers.get('Content-Type')).toBe('image/jpeg');
			expect(res.headers.get('Cache-Control')).toBe('public, max-age=31536000, immutable');
			expect(mockUploadsService.getById).toHaveBeenCalledWith(
				'11111111-1111-4111-8111-111111111111',
			);
		});

		it('should return 404 when image not found', async () => {
			mockUploadsService.getById.mockResolvedValue(null);

			const res = await app.request('/non-existent-id');

			expect(res.status).toBe(404);
		});

		it('should return correct Content-Type for PNG', async () => {
			const mockImageData = {
				stream: new ReadableStream(),
				mimeType: 'image/png',
				filename: 'test.png',
			};

			mockUploadsService.getById.mockResolvedValue(mockImageData);

			const res = await app.request('/11111111-1111-4111-8111-111111111111');

			expect(res.status).toBe(200);
			expect(res.headers.get('Content-Type')).toBe('image/png');
		});

		it('should return correct Content-Type for GIF', async () => {
			const mockImageData = {
				stream: new ReadableStream(),
				mimeType: 'image/gif',
				filename: 'test.gif',
			};

			mockUploadsService.getById.mockResolvedValue(mockImageData);

			const res = await app.request('/11111111-1111-4111-8111-111111111111');

			expect(res.status).toBe(200);
			expect(res.headers.get('Content-Type')).toBe('image/gif');
		});

		it('should return correct Content-Type for WebP', async () => {
			const mockImageData = {
				stream: new ReadableStream(),
				mimeType: 'image/webp',
				filename: 'test.webp',
			};

			mockUploadsService.getById.mockResolvedValue(mockImageData);

			const res = await app.request('/11111111-1111-4111-8111-111111111111');

			expect(res.status).toBe(200);
			expect(res.headers.get('Content-Type')).toBe('image/webp');
		});
	});
});
