import { Readable } from 'node:stream';
import { images } from '@graphite/db';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { UploadsService } from './uploads';

const mockDb = {
  select: vi.fn(),
  insert: vi.fn(),
  delete: vi.fn(),
};

const mockS3 = {
  upload: vi.fn(),
  get: vi.fn(),
  remove: vi.fn(),
};

describe('UploadsService', () => {
  let service: UploadsService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new UploadsService(mockDb as unknown, mockS3 as unknown);
  });

  describe('upload', () => {
    it('should upload a valid JPEG file', async () => {
      const _mockInsert = vi.fn().mockReturnThis();
      const mockValues = vi.fn().mockReturnThis();
      const mockReturning = vi.fn().mockResolvedValue([
        {
          id: '11111111-1111-4111-8111-111111111111',
          s3Key: 'uploads/test.jpg',
          filename: 'test.jpg',
          mimeType: 'image/jpeg',
          sizeBytes: 1024,
          noteId: null,
        },
      ]);

      mockDb.insert = vi.fn().mockReturnValue({
        values: mockValues,
      });
      mockValues.mockReturnValue({
        returning: mockReturning,
      });

      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });

      const result = await service.upload(file);

      expect(result).toEqual({
        id: '11111111-1111-4111-8111-111111111111',
        url: '/api/uploads/11111111-1111-4111-8111-111111111111',
      });
      expect(mockS3.upload).toHaveBeenCalledWith(
        expect.stringMatching(/^uploads\/[0-9a-f-]+\.jpg$/),
        expect.any(Buffer),
        'image/jpeg',
      );
      expect(mockDb.insert).toHaveBeenCalledWith(images);
    });

    it('should upload a file with noteId', async () => {
      const mockReturning = vi.fn().mockResolvedValue([
        {
          id: '11111111-1111-4111-8111-111111111111',
          s3Key: 'uploads/test.png',
          filename: 'test.png',
          mimeType: 'image/png',
          sizeBytes: 2048,
          noteId: '22222222-2222-4222-9222-222222222222',
        },
      ]);

      mockDb.insert = vi.fn().mockReturnValue({
        values: vi.fn().mockReturnValue({ returning: mockReturning }),
      });

      const file = new File(['test'], 'test.png', { type: 'image/png' });
      const noteId = '22222222-2222-4222-9222-222222222222';

      await service.upload(file, noteId);

      expect(mockDb.insert).toHaveBeenCalledWith(images);
    });

    it('should validate MIME type and reject invalid types', async () => {
      const file = new File(['test'], 'test.txt', { type: 'text/plain' });

      await expect(service.upload(file)).rejects.toThrow(/Invalid MIME type: text\/plain/);
      expect(mockS3.upload).not.toHaveBeenCalled();
    });

    it('should validate file size and reject files exceeding limit', async () => {
      const largeContent = 'a'.repeat(11_000_000);
      const file = new File([largeContent], 'large.jpg', { type: 'image/jpeg' });

      await expect(service.upload(file)).rejects.toThrow(
        /File size exceeds maximum of 10485760 bytes/,
      );
      expect(mockS3.upload).not.toHaveBeenCalled();
    });

    it('should generate correct S3 key format with UUID and extension', async () => {
      const mockReturning = vi.fn().mockResolvedValue([
        {
          id: '11111111-1111-4111-8111-111111111111',
          s3Key: 'uploads/test.webp',
          filename: 'test.webp',
          mimeType: 'image/webp',
          sizeBytes: 512,
          noteId: null,
        },
      ]);

      mockDb.insert = vi.fn().mockReturnValue({
        values: vi.fn().mockReturnValue({ returning: mockReturning }),
      });

      const file = new File(['test'], 'test.webp', { type: 'image/webp' });

      await service.upload(file);

      expect(mockS3.upload).toHaveBeenCalledWith(
        expect.stringMatching(
          /^uploads\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.webp$/,
        ),
        expect.any(Buffer),
        'image/webp',
      );
    });
  });

  describe('getById', () => {
    it('should return image data for existing id', async () => {
      const mockLimit = vi.fn().mockReturnThis();
      const mockWhere = vi.fn().mockReturnThis();
      const mockSelect = vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({ where: mockWhere }),
      });
      mockWhere.mockReturnValue({ limit: mockLimit });

      const mockStream = Readable.from(['test data']);
      mockLimit.mockResolvedValue([
        {
          s3Key: 'uploads/test.jpg',
          mimeType: 'image/jpeg',
          filename: 'test.jpg',
        },
      ]);
      mockS3.get.mockResolvedValue({
        stream: mockStream,
        mimeType: 'image/jpeg',
      });

      mockDb.select = mockSelect;

      const result = await service.getById('11111111-1111-4111-8111-111111111111');

      expect(result).not.toBeNull();
      expect(result?.mimeType).toBe('image/jpeg');
      expect(result?.filename).toBe('test.jpg');
      expect(result?.stream).toBeInstanceOf(ReadableStream);
      expect(mockS3.get).toHaveBeenCalledWith('uploads/test.jpg');
    });

    it('should return null when image not found in database', async () => {
      const mockLimit = vi.fn().mockReturnThis();
      const mockWhere = vi.fn().mockReturnThis();
      const mockSelect = vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({ where: mockWhere }),
      });
      mockWhere.mockReturnValue({ limit: mockLimit });

      mockLimit.mockResolvedValue([]);
      mockDb.select = mockSelect;

      const result = await service.getById('non-existent-id');

      expect(result).toBeNull();
      expect(mockS3.get).not.toHaveBeenCalled();
    });

    it('should return null when S3 object not found', async () => {
      const mockLimit = vi.fn().mockReturnThis();
      const mockWhere = vi.fn().mockReturnThis();
      const mockSelect = vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({ where: mockWhere }),
      });
      mockWhere.mockReturnValue({ limit: mockLimit });

      mockLimit.mockResolvedValue([
        {
          s3Key: 'uploads/test.jpg',
          mimeType: 'image/jpeg',
          filename: 'test.jpg',
        },
      ]);
      mockS3.get.mockResolvedValue(null);
      mockDb.select = mockSelect;

      const result = await service.getById('11111111-1111-4111-8111-111111111111');

      expect(result).toBeNull();
    });
  });

  describe('removeByNoteId', () => {
    it('should delete all images associated with a note from both S3 and database', async () => {
      const mockWhere = vi.fn().mockReturnThis();
      const mockDelete = vi.fn().mockReturnValue({ where: mockWhere });

      mockDb.select = vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([
            { s3Key: 'uploads/image1.jpg', id: 'id1' },
            { s3Key: 'uploads/image2.png', id: 'id2' },
          ]),
        }),
      });
      mockDb.delete = mockDelete;

      await service.removeByNoteId('22222222-2222-4222-9222-222222222222');

      expect(mockS3.remove).toHaveBeenCalledWith('uploads/image1.jpg');
      expect(mockS3.remove).toHaveBeenCalledWith('uploads/image2.png');
      expect(mockDb.delete).toHaveBeenCalledWith(images);
      expect(mockWhere).toHaveBeenCalled();
    });

    it('should handle note with no associated images', async () => {
      const mockWhere = vi.fn().mockReturnThis();
      const mockDelete = vi.fn().mockReturnValue({ where: mockWhere });

      mockDb.select = vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([]),
        }),
      });
      mockDb.delete = mockDelete;

      await service.removeByNoteId('22222222-2222-4222-9222-222222222222');

      expect(mockS3.remove).not.toHaveBeenCalled();
      expect(mockDb.delete).toHaveBeenCalledWith(images);
    });
  });
});
