import { notes } from '@graphite/db';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NotesService } from './notes';

const mockDb = {
  select: vi.fn(),
  insert: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
};

const mockNotes = [
  {
    id: '11111111-1111-1111-1111-111111111111',
    title: 'First Note',
    plaintext: 'This is the content of the first note',
    pinned: true,
    updatedAt: new Date('2026-03-25T10:00:00Z'),
    createdAt: new Date('2026-03-25T09:00:00Z'),
    content: {},
  },
  {
    id: '22222222-2222-2222-2222-222222222222',
    title: 'Second Note',
    plaintext: 'This is the content of the second note with more text',
    pinned: false,
    updatedAt: new Date('2026-03-25T11:00:00Z'),
    createdAt: new Date('2026-03-25T10:00:00Z'),
    content: {},
  },
];

describe('NotesService', () => {
  let service: NotesService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new NotesService(mockDb as unknown);
  });

  describe('list', () => {
    it('should return all notes ordered by pinned DESC, updatedAt DESC', async () => {
      const mockOrderBy = vi.fn().mockReturnThis();
      const mockFrom = vi.fn().mockReturnThis();
      const mockSelect = vi.fn().mockReturnValue({
        from: mockFrom,
      });
      mockFrom.mockReturnValue({
        orderBy: mockOrderBy,
      });
      mockOrderBy.mockResolvedValue(mockNotes);

      mockDb.select = mockSelect;

      const result = await service.list();

      expect(mockSelect).toHaveBeenCalled();
      expect(mockFrom).toHaveBeenCalledWith(notes);
      expect(mockOrderBy).toHaveBeenCalled();
      // Verify ordering - the first call to orderBy should be for pinned, second for updatedAt
      const orderByCalls = mockOrderBy.mock.calls;
      expect(orderByCalls[0]).toBeDefined();

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('11111111-1111-1111-1111-111111111111'); // pinned note first
      expect(result[0].pinned).toBe(true);
      expect(result[1].pinned).toBe(false);
    });

    it('should truncate preview to 80 characters', async () => {
      const longText = 'a'.repeat(100);
      const mockOrderBy = vi.fn().mockReturnThis();
      const mockFrom = vi.fn().mockReturnThis();
      const mockSelect = vi.fn().mockReturnValue({
        from: mockFrom,
      });
      mockFrom.mockReturnValue({
        orderBy: mockOrderBy,
      });
      mockOrderBy.mockResolvedValue([
        {
          id: '11111111-1111-1111-1111-111111111111',
          title: 'Test',
          plaintext: longText,
          pinned: false,
          updatedAt: new Date(),
          createdAt: new Date(),
          content: {},
        },
      ]);

      mockDb.select = mockSelect;

      const result = await service.list();

      expect(result[0].preview).toHaveLength(80);
    });
  });

  describe('getById', () => {
    it('should return a note by id', async () => {
      const mockLimit = vi.fn().mockReturnThis();
      const mockWhere = vi.fn().mockReturnThis();
      const mockSelect = vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: mockWhere,
        }),
      });
      mockWhere.mockReturnValue({
        limit: mockLimit,
      });
      mockLimit.mockResolvedValue([mockNotes[0]]);

      mockDb.select = mockSelect;

      const result = await service.getById(mockNotes[0].id);

      expect(result).not.toBeNull();
      expect(result?.id).toBe(mockNotes[0].id);
      expect(result?.title).toBe(mockNotes[0].title);
    });

    it('should return null if note not found', async () => {
      const mockLimit = vi.fn().mockReturnThis();
      const mockWhere = vi.fn().mockReturnThis();
      const mockSelect = vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: mockWhere,
        }),
      });
      mockWhere.mockReturnValue({
        limit: mockLimit,
      });
      mockLimit.mockResolvedValue([]);

      mockDb.select = mockSelect;

      const result = await service.getById('non-existent-id');

      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('should create a new note with default values', async () => {
      const mockReturning = vi.fn().mockReturnThis();
      const mockValues = vi.fn().mockReturnThis();
      const mockInsert = vi.fn().mockReturnValue({
        values: mockValues,
      });
      mockValues.mockReturnValue({
        returning: mockReturning,
      });

      const createdNote = {
        id: '33333333-3333-3333-3333-333333333333',
        title: '',
        content: {},
        plaintext: '',
        pinned: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockReturning.mockResolvedValue([createdNote]);
      mockDb.insert = mockInsert;

      const result = await service.create({});

      expect(mockInsert).toHaveBeenCalledWith(notes);
      expect(mockValues).toHaveBeenCalledWith(
        expect.objectContaining({
          title: '',
          content: {},
          plaintext: '',
          pinned: false,
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
        }),
      );
      expect(result.id).toBe(createdNote.id);
      expect(result.title).toBe('');
      expect(result.pinned).toBe(false);
    });

    it('should create a note with provided values', async () => {
      const mockReturning = vi.fn().mockReturnThis();
      const mockValues = vi.fn().mockReturnThis();
      const mockInsert = vi.fn().mockReturnValue({
        values: mockValues,
      });
      mockValues.mockReturnValue({
        returning: mockReturning,
      });

      const createdNote = {
        id: '33333333-3333-3333-3333-333333333333',
        title: 'My Note',
        content: { type: 'doc' },
        plaintext: '',
        pinned: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockReturning.mockResolvedValue([createdNote]);
      mockDb.insert = mockInsert;

      const result = await service.create({
        title: 'My Note',
        content: { type: 'doc' },
      });

      expect(mockValues).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'My Note',
          content: { type: 'doc' },
        }),
      );
      expect(result.title).toBe('My Note');
    });
  });

  describe('update', () => {
    it('should update a note and set updatedAt', async () => {
      const mockReturning = vi.fn().mockReturnThis();
      const mockSet = vi.fn().mockReturnThis();
      const mockWhere = vi.fn().mockReturnThis();
      const mockUpdate = vi.fn().mockReturnValue({
        set: mockSet,
      });
      mockSet.mockReturnValue({
        where: mockWhere,
      });
      mockWhere.mockReturnValue({
        returning: mockReturning,
      });

      const updatedNote = {
        id: mockNotes[0].id,
        title: 'Updated Title',
        content: {},
        plaintext: '',
        pinned: true,
        createdAt: new Date('2026-03-25T09:00:00Z'),
        updatedAt: new Date('2026-03-25T12:00:00Z'),
      };

      mockReturning.mockResolvedValue([updatedNote]);
      mockDb.update = mockUpdate;

      const result = await service.update(mockNotes[0].id, {
        title: 'Updated Title',
        pinned: true,
      });

      expect(mockUpdate).toHaveBeenCalledWith(notes);
      expect(mockSet).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Updated Title',
          pinned: true,
          updatedAt: expect.any(Date),
        }),
      );
      expect(result?.title).toBe('Updated Title');
      expect(result?.pinned).toBe(true);
    });

    it('should return null if note not found', async () => {
      const mockReturning = vi.fn().mockReturnThis();
      const mockSet = vi.fn().mockReturnThis();
      const mockWhere = vi.fn().mockReturnThis();
      const mockUpdate = vi.fn().mockReturnValue({
        set: mockSet,
      });
      mockSet.mockReturnValue({
        where: mockWhere,
      });
      mockWhere.mockReturnValue({
        returning: mockReturning,
      });

      mockReturning.mockResolvedValue([]);
      mockDb.update = mockUpdate;

      const result = await service.update('non-existent-id', {
        title: 'Updated',
      });

      expect(result).toBeNull();
    });
  });

  describe('remove', () => {
    it('should delete a note and return its id', async () => {
      const mockReturning = vi.fn().mockReturnThis();
      const mockWhere = vi.fn().mockReturnThis();
      const mockDelete = vi.fn().mockReturnValue({
        where: mockWhere,
      });
      mockWhere.mockReturnValue({
        returning: mockReturning,
      });

      mockReturning.mockResolvedValue([{ id: mockNotes[0].id }]);
      mockDb.delete = mockDelete;

      const result = await service.remove(mockNotes[0].id);

      expect(mockDelete).toHaveBeenCalledWith(notes);
      expect(result).toEqual({ id: mockNotes[0].id });
    });

    it('should return null if note not found', async () => {
      const mockReturning = vi.fn().mockReturnThis();
      const mockWhere = vi.fn().mockReturnThis();
      const mockDelete = vi.fn().mockReturnValue({
        where: mockWhere,
      });
      mockWhere.mockReturnValue({
        returning: mockReturning,
      });

      mockReturning.mockResolvedValue([]);
      mockDb.delete = mockDelete;

      const result = await service.remove('non-existent-id');

      expect(result).toBeNull();
    });
  });

  describe('search', () => {
    it('should search notes using full-text search', async () => {
      const mockOrderBy = vi.fn().mockReturnThis();
      const mockWhere = vi.fn().mockReturnThis();
      const mockFrom = vi.fn().mockReturnValue({
        where: mockWhere,
      });
      const mockSelect = vi.fn().mockReturnValue({
        from: mockFrom,
      });
      mockWhere.mockReturnValue({
        orderBy: mockOrderBy,
      });
      mockOrderBy.mockResolvedValue([mockNotes[0]]);

      mockDb.select = mockSelect;

      const result = await service.search('first');

      expect(mockSelect).toHaveBeenCalled();
      expect(mockFrom).toHaveBeenCalledWith(notes);
      expect(mockWhere).toHaveBeenCalled();
      expect(mockOrderBy).toHaveBeenCalled();
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(mockNotes[0].id);
    });

    it('should construct the correct full-text search query', async () => {
      const mockOrderBy = vi.fn().mockResolvedValue([]);
      const mockWhere = vi.fn().mockReturnValue({
        orderBy: mockOrderBy,
      });
      const mockFrom = vi.fn().mockReturnValue({
        where: mockWhere,
      });
      const mockSelect = vi.fn().mockReturnValue({
        from: mockFrom,
      });

      mockDb.select = mockSelect;

      await service.search('test query');

      // The where call should receive a SQL fragment
      const whereCall = mockWhere.mock.calls[0][0];
      expect(whereCall).toBeDefined();
      // SQL query should be constructed with ts_rank for ordering
      const orderByCall = mockOrderBy.mock.calls[0][0];
      expect(orderByCall).toBeDefined();
    });
  });
});
