import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { prisma } from '@nucleus/database';
import { PropertyType } from '@nucleus/domain';
import { AppLogger } from '../../common/logger/app-logger.service';
import { defaultInitializationConfig } from '../../config/initialization.config';
import { PropertyTypeRegistry } from '../../property/types';
import { DatabaseService } from '../database.service';

jest.mock('@nucleus/database', () => ({
  prisma: {
    space: {
      findFirst: jest.fn(),
    },
    database: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    $transaction: jest.fn(),
  },
}));

describe('DatabaseService', () => {
  let service: DatabaseService;

  const mockLogger = {
    setContext: jest.fn(),
    debug: jest.fn(),
    log: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  };

  const mockHandler = {
    type: PropertyType.TEXT,
    getDefaultConfig: jest.fn().mockReturnValue({ defaultValue: '', isRichText: false }),
    validateConfig: jest.fn().mockReturnValue(null),
  };

  const mockTypeRegistry = {
    getHandler: jest.fn().mockReturnValue(mockHandler),
  };

  const mockSpace = {
    id: 'space-123',
    ownerId: 'user-123',
    name: 'Test Space',
  };

  const mockDatabase = {
    id: 'db-123',
    spaceId: 'space-123',
    name: 'Test DB',
    title: 'Test Database',
    icon: null,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    sectionId: null,
    config: { version: 1, type: 'custom' },
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DatabaseService,
        { provide: AppLogger, useValue: mockLogger },
        { provide: PropertyTypeRegistry, useValue: mockTypeRegistry },
      ],
    }).compile();

    service = module.get<DatabaseService>(DatabaseService);
  });

  describe('create', () => {
    it('should create a database with default properties and return DatabaseResponseDto', async () => {
      (prisma.space.findFirst as jest.Mock).mockResolvedValue(mockSpace);
      (prisma.database.findFirst as jest.Mock).mockResolvedValue(null);

      const mockTx = {
        database: {
          create: jest.fn<() => Promise<typeof mockDatabase>>().mockResolvedValue(mockDatabase),
        },
        property: {
          create: jest.fn().mockResolvedValue({}),
        },
      };
      (prisma.$transaction as jest.Mock).mockImplementation(
        async (cb: (tx: typeof mockTx) => Promise<unknown>) => cb(mockTx),
      );

      const result = await service.create(
        'space-123',
        { name: 'Test DB', title: 'Test Database' },
        'user-123',
      );

      expect(result.id).toBe('db-123');
      expect(result.name).toBe('Test DB');
      expect(prisma.space.findFirst).toHaveBeenCalledWith({
        where: { id: 'space-123', ownerId: 'user-123' },
      });
      expect(prisma.database.findFirst).toHaveBeenCalledWith({
        where: { name: 'Test DB', spaceId: 'space-123' },
      });
      expect(mockTx.database.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          name: 'Test DB',
          title: 'Test Database',
          spaceId: 'space-123',
        }),
      });
      // One default property (Name/TEXT) per defaultInitializationConfig
      expect(mockTx.property.create).toHaveBeenCalledTimes(
        defaultInitializationConfig.defaultDatabaseProperties.length,
      );
      expect(mockTx.property.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          name: 'Name',
          type: 'TEXT',
          position: 0,
          isRequired: true,
          databaseId: 'db-123',
        }),
      });
      expect(mockLogger.log).toHaveBeenCalledWith('Database created with default properties', {
        databaseId: 'db-123',
        spaceId: 'space-123',
        propertyCount: defaultInitializationConfig.defaultDatabaseProperties.length,
      });
    });

    it('should throw NotFoundException when space not found or not owned by user', async () => {
      (prisma.space.findFirst as jest.Mock).mockResolvedValue(null);

      await expect(
        service.create('space-nonexistent', { name: 'Test DB' }, 'user-123'),
      ).rejects.toThrow(NotFoundException);
      await expect(
        service.create('space-nonexistent', { name: 'Test DB' }, 'user-123'),
      ).rejects.toThrow('Space not found');
    });

    it('should throw ConflictException when database name already taken in space', async () => {
      (prisma.space.findFirst as jest.Mock).mockResolvedValue(mockSpace);
      (prisma.database.findFirst as jest.Mock).mockResolvedValue(mockDatabase);

      await expect(
        service.create('space-123', { name: 'Test DB' }, 'user-123'),
      ).rejects.toThrow(ConflictException);
      await expect(
        service.create('space-123', { name: 'Test DB' }, 'user-123'),
      ).rejects.toThrow('Database name is already taken in this space.');
    });
  });

  describe('findAll', () => {
    it('should return array of DatabaseResponseDto for the space', async () => {
      const databases = [
        mockDatabase,
        { ...mockDatabase, id: 'db-456', name: 'DB 2' },
      ];
      (prisma.database.findMany as jest.Mock).mockResolvedValue(databases);

      const result = await service.findAll('space-123', 'user-123');

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('db-123');
      expect(result[1].id).toBe('db-456');
      expect(prisma.database.findMany).toHaveBeenCalledWith({
        where: { spaceId: 'space-123', space: { ownerId: 'user-123' } },
      });
    });

    it('should return empty array when no databases', async () => {
      (prisma.database.findMany as jest.Mock).mockResolvedValue([]);

      const result = await service.findAll('space-123', 'user-123');

      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should return DatabaseResponseDto for valid id', async () => {
      (prisma.database.findUnique as jest.Mock).mockResolvedValue(mockDatabase);

      const result = await service.findOne('db-123');

      expect(result.id).toBe('db-123');
      expect(result.name).toBe('Test DB');
      expect(prisma.database.findUnique).toHaveBeenCalledWith({
        where: { id: 'db-123' },
      });
    });

    it('should throw NotFoundException when database not found', async () => {
      (prisma.database.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.findOne('nonexistent')).rejects.toThrow(NotFoundException);
      await expect(service.findOne('nonexistent')).rejects.toThrow(
        'Database with id nonexistent not found',
      );
    });
  });

  describe('update', () => {
    it('should update database fields and return DatabaseResponseDto', async () => {
      const updatedDatabase = { ...mockDatabase, name: 'Updated DB', title: 'New Title' };
      (prisma.database.findUnique as jest.Mock).mockResolvedValue(mockDatabase);
      (prisma.database.update as jest.Mock).mockResolvedValue(updatedDatabase);

      const result = await service.update('db-123', { name: 'Updated DB', title: 'New Title' });

      expect(result.name).toBe('Updated DB');
      expect(result.title).toBe('New Title');
      expect(prisma.database.findUnique).toHaveBeenCalledWith({ where: { id: 'db-123' } });
      expect(prisma.database.update).toHaveBeenCalledWith({
        where: { id: 'db-123' },
        data: { name: 'Updated DB', title: 'New Title', icon: undefined, sectionId: undefined },
      });
      expect(mockLogger.log).toHaveBeenCalledWith('Database updated', { id: 'db-123' });
    });

    it('should throw NotFoundException when database not found', async () => {
      (prisma.database.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.update('nonexistent', { name: 'Updated' })).rejects.toThrow(NotFoundException);
      await expect(service.update('nonexistent', { name: 'Updated' })).rejects.toThrow(
        'Database with id nonexistent not found',
      );
    });
  });

  describe('remove', () => {
    it('should delete database and return DatabaseResponseDto', async () => {
      (prisma.database.findUnique as jest.Mock).mockResolvedValue(mockDatabase);
      (prisma.database.delete as jest.Mock).mockResolvedValue(mockDatabase);

      const result = await service.remove('db-123');

      expect(result.id).toBe('db-123');
      expect(prisma.database.findUnique).toHaveBeenCalledWith({ where: { id: 'db-123' } });
      expect(prisma.database.delete).toHaveBeenCalledWith({ where: { id: 'db-123' } });
      expect(mockLogger.log).toHaveBeenCalledWith('Database removed', { id: 'db-123' });
    });

    it('should throw NotFoundException when database not found', async () => {
      (prisma.database.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.remove('nonexistent')).rejects.toThrow(NotFoundException);
      await expect(service.remove('nonexistent')).rejects.toThrow(
        'Database with id nonexistent not found',
      );
    });
  });
});
