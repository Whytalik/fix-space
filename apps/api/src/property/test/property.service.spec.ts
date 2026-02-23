import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { prisma } from '@nucleus/database';
import { PropertyType } from '@nucleus/domain';
import { AppLogger } from '../../common/logger/app-logger.service';
import { PropertyTypeRegistry } from '../types';
import { PropertyService } from '../property.service';

jest.mock('@nucleus/database', () => ({
  prisma: {
    database: {
      findFirst: jest.fn(),
    },
    property: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  },
}));

describe('PropertyService', () => {
  let service: PropertyService;

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
    validateValue: jest.fn().mockReturnValue(null),
    formatValue: jest.fn((v: unknown) => v),
    getDefaultValue: jest.fn().mockReturnValue(''),
  };

  const mockTypeRegistry = {
    getHandler: jest.fn().mockReturnValue(mockHandler),
  };

  const mockDatabase = {
    id: 'db-123',
    spaceId: 'space-123',
    name: 'Test Database',
  };

  const mockProperty = {
    id: 'prop-123',
    databaseId: 'db-123',
    name: 'Title',
    type: 'text',
    position: 0,
    icon: null,
    color: null,
    isRequired: false,
    isPrimary: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    config: { defaultValue: '', isRichText: false },
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PropertyService,
        { provide: AppLogger, useValue: mockLogger },
        { provide: PropertyTypeRegistry, useValue: mockTypeRegistry },
      ],
    }).compile();

    service = module.get<PropertyService>(PropertyService);
  });

  describe('create', () => {
    it('should create a property and return PropertyResponseDto', async () => {
      (prisma.database.findFirst as jest.Mock).mockResolvedValue(mockDatabase);
      (prisma.property.findFirst as jest.Mock).mockResolvedValue(null);
      (prisma.property.create as jest.Mock).mockResolvedValue(mockProperty);

      const result = await service.create(
        'db-123',
        { name: 'Title', type: PropertyType.TEXT, position: 0 },
        'user-123',
      );

      expect(result.id).toBe('prop-123');
      expect(result.name).toBe('Title');
      expect(prisma.database.findFirst).toHaveBeenCalledWith({
        where: { id: 'db-123', space: { ownerId: 'user-123' } },
      });
      expect(mockTypeRegistry.getHandler).toHaveBeenCalledWith(PropertyType.TEXT);
      expect(mockHandler.getDefaultConfig).toHaveBeenCalled();
      expect(mockHandler.validateConfig).toHaveBeenCalled();
      expect(prisma.property.create).toHaveBeenCalledTimes(1);
      expect(mockLogger.log).toHaveBeenCalledWith('Property created', {
        propertyId: 'prop-123',
        databaseId: 'db-123',
      });
    });

    it('should merge user-supplied config with handler default config', async () => {
      (prisma.database.findFirst as jest.Mock).mockResolvedValue(mockDatabase);
      (prisma.property.findFirst as jest.Mock).mockResolvedValue(null);
      (prisma.property.create as jest.Mock).mockResolvedValue(mockProperty);

      await service.create(
        'db-123',
        { name: 'Title', type: PropertyType.TEXT, position: 0, config: { isRichText: true } },
        'user-123',
      );

      expect(mockHandler.validateConfig).toHaveBeenCalledWith({
        defaultValue: '',
        isRichText: true,
      });
      expect(prisma.property.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            config: { defaultValue: '', isRichText: true },
          }),
        }),
      );
    });

    it('should throw NotFoundException when database not found', async () => {
      (prisma.database.findFirst as jest.Mock).mockResolvedValue(null);

      await expect(
        service.create('db-nonexistent', { name: 'Title', type: PropertyType.TEXT, position: 0 }, 'user-123'),
      ).rejects.toThrow(NotFoundException);
      await expect(
        service.create('db-nonexistent', { name: 'Title', type: PropertyType.TEXT, position: 0 }, 'user-123'),
      ).rejects.toThrow('Database not found');
    });

    it('should throw ConflictException when property name already taken', async () => {
      (prisma.database.findFirst as jest.Mock).mockResolvedValue(mockDatabase);
      (prisma.property.findFirst as jest.Mock).mockResolvedValue(mockProperty);

      await expect(
        service.create('db-123', { name: 'Title', type: PropertyType.TEXT, position: 0 }, 'user-123'),
      ).rejects.toThrow(ConflictException);
      await expect(
        service.create('db-123', { name: 'Title', type: PropertyType.TEXT, position: 0 }, 'user-123'),
      ).rejects.toThrow('Property name is already taken in this database.');
    });

    it('should throw BadRequestException when config validation fails', async () => {
      (prisma.database.findFirst as jest.Mock).mockResolvedValue(mockDatabase);
      (prisma.property.findFirst as jest.Mock).mockResolvedValue(null);
      mockHandler.validateConfig
        .mockReturnValueOnce(['defaultValue must be a string'])
        .mockReturnValueOnce(['defaultValue must be a string']);

      await expect(
        service.create('db-123', { name: 'Title', type: PropertyType.TEXT, position: 0 }, 'user-123'),
      ).rejects.toThrow(BadRequestException);
      await expect(
        service.create('db-123', { name: 'Title', type: PropertyType.TEXT, position: 0 }, 'user-123'),
      ).rejects.toThrow('Invalid config for TEXT');
    });
  });

  describe('findAll', () => {
    it('should return array of PropertyResponseDto ordered by position', async () => {
      const properties = [mockProperty, { ...mockProperty, id: 'prop-456', name: 'Status', position: 1 }];
      (prisma.property.findMany as jest.Mock).mockResolvedValue(properties);

      const result = await service.findAll('db-123', 'user-123');

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('prop-123');
      expect(result[1].id).toBe('prop-456');
      expect(prisma.property.findMany).toHaveBeenCalledWith({
        where: { databaseId: 'db-123', database: { space: { ownerId: 'user-123' } } },
        orderBy: { position: 'asc' },
      });
    });

    it('should return empty array when no properties', async () => {
      (prisma.property.findMany as jest.Mock).mockResolvedValue([]);

      const result = await service.findAll('db-123', 'user-123');

      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should return PropertyResponseDto for valid id', async () => {
      (prisma.property.findFirst as jest.Mock).mockResolvedValue(mockProperty);

      const result = await service.findOne('prop-123', 'user-123');

      expect(result.id).toBe('prop-123');
      expect(result.name).toBe('Title');
      expect(prisma.property.findFirst).toHaveBeenCalledWith({
        where: { id: 'prop-123', database: { space: { ownerId: 'user-123' } } },
      });
    });

    it('should throw NotFoundException when property not found', async () => {
      (prisma.property.findFirst as jest.Mock).mockResolvedValue(null);

      await expect(service.findOne('nonexistent', 'user-123')).rejects.toThrow(NotFoundException);
      await expect(service.findOne('nonexistent', 'user-123')).rejects.toThrow(
        'Property with id nonexistent not found',
      );
    });
  });

  describe('update', () => {
    it('should update property fields and return PropertyResponseDto', async () => {
      const updatedProperty = { ...mockProperty, name: 'Updated Title', icon: '🔤' };
      (prisma.property.findFirst as jest.Mock).mockResolvedValueOnce(mockProperty).mockResolvedValueOnce(null);
      (prisma.property.update as jest.Mock).mockResolvedValue(updatedProperty);

      const result = await service.update(
        'prop-123',
        { name: 'Updated Title', icon: '🔤' },
        'user-123',
      );

      expect(result.name).toBe('Updated Title');
      expect(result.icon).toBe('🔤');
      expect(prisma.property.findFirst).toHaveBeenCalledWith({
        where: { id: 'prop-123', database: { space: { ownerId: 'user-123' } } },
      });
      expect(prisma.property.update).toHaveBeenCalledWith({
        where: { id: 'prop-123' },
        data: expect.objectContaining({ name: 'Updated Title', icon: '🔤' }),
      });
      expect(mockLogger.log).toHaveBeenCalledWith('Property updated', { id: 'prop-123' });
    });

    it('should not check name conflict when name is unchanged', async () => {
      (prisma.property.findFirst as jest.Mock).mockResolvedValue(mockProperty);
      (prisma.property.update as jest.Mock).mockResolvedValue(mockProperty);

      await service.update('prop-123', { name: 'Title' }, 'user-123');

      // findFirst called once for ownership check, NOT again for name conflict
      expect(prisma.property.findFirst).toHaveBeenCalledTimes(1);
    });

    it('should throw NotFoundException when property not found', async () => {
      (prisma.property.findFirst as jest.Mock).mockResolvedValue(null);

      await expect(
        service.update('nonexistent', { name: 'Updated' }, 'user-123'),
      ).rejects.toThrow(NotFoundException);
      await expect(
        service.update('nonexistent', { name: 'Updated' }, 'user-123'),
      ).rejects.toThrow('Property with id nonexistent not found');
    });

    it('should throw ConflictException when new name is taken by another property', async () => {
      const anotherProperty = { ...mockProperty, id: 'prop-other', name: 'New Name' };
      (prisma.property.findFirst as jest.Mock)
        .mockResolvedValueOnce(mockProperty)
        .mockResolvedValueOnce(anotherProperty)
        .mockResolvedValueOnce(mockProperty)
        .mockResolvedValueOnce(anotherProperty);

      await expect(
        service.update('prop-123', { name: 'New Name' }, 'user-123'),
      ).rejects.toThrow(ConflictException);
      await expect(
        service.update('prop-123', { name: 'New Name' }, 'user-123'),
      ).rejects.toThrow('Property name is already taken in this database.');
    });

    it('should reset config to new handler default when type changes', async () => {
      const newDefaultConfig = { format: 'number', precision: 2 };
      const newMockHandler = {
        ...mockHandler,
        type: PropertyType.NUMBER,
        getDefaultConfig: jest.fn().mockReturnValue(newDefaultConfig),
        validateConfig: jest.fn().mockReturnValue(null),
      };
      mockTypeRegistry.getHandler.mockReturnValueOnce(newMockHandler);
      (prisma.property.findFirst as jest.Mock).mockResolvedValue(mockProperty);
      (prisma.property.update as jest.Mock).mockResolvedValue({ ...mockProperty, type: 'number', config: newDefaultConfig });

      await service.update('prop-123', { type: PropertyType.NUMBER }, 'user-123');

      expect(newMockHandler.getDefaultConfig).toHaveBeenCalled();
    });

    it('should throw BadRequestException when config validation fails on update', async () => {
      mockHandler.validateConfig.mockReturnValueOnce(['invalid field']);
      (prisma.property.findFirst as jest.Mock).mockResolvedValue(mockProperty);

      await expect(
        service.update('prop-123', { config: { badField: 'bad' } }, 'user-123'),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('remove', () => {
    it('should delete property and return PropertyResponseDto', async () => {
      (prisma.property.findFirst as jest.Mock).mockResolvedValue(mockProperty);
      (prisma.property.delete as jest.Mock).mockResolvedValue(mockProperty);

      const result = await service.remove('prop-123', 'user-123');

      expect(result.id).toBe('prop-123');
      expect(prisma.property.findFirst).toHaveBeenCalledWith({
        where: { id: 'prop-123', database: { space: { ownerId: 'user-123' } } },
      });
      expect(prisma.property.delete).toHaveBeenCalledWith({ where: { id: 'prop-123' } });
      expect(mockLogger.log).toHaveBeenCalledWith('Property removed', { id: 'prop-123' });
    });

    it('should throw NotFoundException when property not found', async () => {
      (prisma.property.findFirst as jest.Mock).mockResolvedValue(null);

      await expect(service.remove('nonexistent', 'user-123')).rejects.toThrow(NotFoundException);
      await expect(service.remove('nonexistent', 'user-123')).rejects.toThrow(
        'Property with id nonexistent not found',
      );
    });
  });
});
