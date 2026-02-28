import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { prisma } from '@nucleus/database';
import { PropertyType } from '@nucleus/domain';
import { AppLogger } from '../../common/logger/app-logger.service';
import { PropertyTypeRegistry } from '../../property/types';
import { PropertyValueService } from '../property-value.service';

jest.mock('@nucleus/database', () => ({
  prisma: {
    record: {
      findFirst: jest.fn(),
    },
    property: {
      findUnique: jest.fn(),
    },
    propertyValue: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  },
}));

describe('PropertyValueService', () => {
  let service: PropertyValueService;

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

  const mockRecord = {
    id: 'record-123',
    databaseId: 'db-123',
    name: 'Test Record',
  };

  const mockProperty = {
    id: 'prop-123',
    databaseId: 'db-123',
    name: 'Title',
    type: 'text',
    config: { defaultValue: '', isRichText: false },
  };

  const mockPropertyValue = {
    id: 'pv-123',
    recordId: 'record-123',
    propertyId: 'prop-123',
    value: 'Hello',
    computed: false,
  };

  const mockPropertyValueWithProperty = {
    ...mockPropertyValue,
    property: mockProperty,
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PropertyValueService,
        { provide: AppLogger, useValue: mockLogger },
        { provide: PropertyTypeRegistry, useValue: mockTypeRegistry },
      ],
    }).compile();

    service = module.get<PropertyValueService>(PropertyValueService);
  });

  describe('create', () => {
    it('should create a property value and return PropertyValueResponseDto', async () => {
      (prisma.record.findFirst as jest.Mock).mockResolvedValue(mockRecord);
      (prisma.property.findUnique as jest.Mock).mockResolvedValue(mockProperty);
      (prisma.propertyValue.findUnique as jest.Mock).mockResolvedValue(null);
      (prisma.propertyValue.create as jest.Mock).mockResolvedValue(mockPropertyValue);

      const result = await service.create('record-123', { propertyId: 'prop-123', value: 'Hello' }, 'user-123');

      expect(result.id).toBe('pv-123');
      expect(result.value).toBe('Hello');
      expect(prisma.record.findFirst).toHaveBeenCalledWith({
        where: { id: 'record-123', database: { space: { ownerId: 'user-123' } } },
      });
      expect(prisma.property.findUnique).toHaveBeenCalledWith({
        where: { id: 'prop-123' },
      });
      expect(prisma.propertyValue.findUnique).toHaveBeenCalledWith({
        where: { recordId_propertyId: { recordId: 'record-123', propertyId: 'prop-123' } },
      });
      expect(mockHandler.validateValue).toHaveBeenCalledWith('Hello', mockProperty.config);
      expect(mockHandler.formatValue).toHaveBeenCalledWith('Hello', mockProperty.config);
      expect(prisma.propertyValue.create).toHaveBeenCalledWith({
        data: {
          recordId: 'record-123',
          propertyId: 'prop-123',
          value: 'Hello',
          computed: false,
        },
      });
      expect(mockLogger.log).toHaveBeenCalledWith('Property value created', {
        propertyValueId: 'pv-123',
        recordId: 'record-123',
      });
    });

    it('should use handler.getDefaultValue when dto.value is undefined', async () => {
      (prisma.record.findFirst as jest.Mock).mockResolvedValue(mockRecord);
      (prisma.property.findUnique as jest.Mock).mockResolvedValue(mockProperty);
      (prisma.propertyValue.findUnique as jest.Mock).mockResolvedValue(null);
      (prisma.propertyValue.create as jest.Mock).mockResolvedValue({ ...mockPropertyValue, value: '' });

      await service.create('record-123', { propertyId: 'prop-123' }, 'user-123');

      expect(mockHandler.getDefaultValue).toHaveBeenCalledWith(mockProperty.config);
      expect(mockHandler.validateValue).toHaveBeenCalledWith('', mockProperty.config);
    });

    it('should throw NotFoundException when record not found', async () => {
      (prisma.record.findFirst as jest.Mock).mockResolvedValue(null);

      await expect(service.create('record-nonexistent', { propertyId: 'prop-123' }, 'user-123')).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.create('record-nonexistent', { propertyId: 'prop-123' }, 'user-123')).rejects.toThrow(
        'Record with id record-nonexistent not found',
      );
    });

    it('should throw NotFoundException when property not found', async () => {
      (prisma.record.findFirst as jest.Mock).mockResolvedValue(mockRecord);
      (prisma.property.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.create('record-123', { propertyId: 'prop-nonexistent' }, 'user-123')).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.create('record-123', { propertyId: 'prop-nonexistent' }, 'user-123')).rejects.toThrow(
        'Property with id prop-nonexistent not found',
      );
    });

    it('should throw ConflictException when property belongs to a different database', async () => {
      const propertyOtherDb = { ...mockProperty, databaseId: 'db-other' };
      (prisma.record.findFirst as jest.Mock).mockResolvedValue(mockRecord);
      (prisma.property.findUnique as jest.Mock).mockResolvedValue(propertyOtherDb);

      await expect(service.create('record-123', { propertyId: 'prop-123' }, 'user-123')).rejects.toThrow(
        ConflictException,
      );
      await expect(service.create('record-123', { propertyId: 'prop-123' }, 'user-123')).rejects.toThrow(
        'Property does not belong to the same database as the record',
      );
    });

    it('should throw ConflictException when property value already exists', async () => {
      (prisma.record.findFirst as jest.Mock).mockResolvedValue(mockRecord);
      (prisma.property.findUnique as jest.Mock).mockResolvedValue(mockProperty);
      (prisma.propertyValue.findUnique as jest.Mock).mockResolvedValue(mockPropertyValue);

      await expect(service.create('record-123', { propertyId: 'prop-123' }, 'user-123')).rejects.toThrow(
        ConflictException,
      );
      await expect(service.create('record-123', { propertyId: 'prop-123' }, 'user-123')).rejects.toThrow(
        'A value for this property already exists on this record',
      );
    });

    it('should throw BadRequestException when value validation fails', async () => {
      (prisma.record.findFirst as jest.Mock).mockResolvedValue(mockRecord);
      (prisma.property.findUnique as jest.Mock).mockResolvedValue(mockProperty);
      (prisma.propertyValue.findUnique as jest.Mock).mockResolvedValue(null);
      mockHandler.validateValue
        .mockReturnValueOnce(['Text value must be a string or null'])
        .mockReturnValueOnce(['Text value must be a string or null']);

      await expect(service.create('record-123', { propertyId: 'prop-123', value: 123 }, 'user-123')).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.create('record-123', { propertyId: 'prop-123', value: 123 }, 'user-123')).rejects.toThrow(
        'Invalid value for property type text',
      );
    });
  });

  describe('findAll', () => {
    it('should return array of PropertyValueResponseDto', async () => {
      const values = [
        mockPropertyValueWithProperty,
        { ...mockPropertyValueWithProperty, id: 'pv-456', value: 'World' },
      ];
      (prisma.propertyValue.findMany as jest.Mock).mockResolvedValue(values);

      const result = await service.findAll('record-123', 'user-123');

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('pv-123');
      expect(result[1].id).toBe('pv-456');
      expect(prisma.propertyValue.findMany).toHaveBeenCalledWith({
        where: { recordId: 'record-123', record: { database: { space: { ownerId: 'user-123' } } } },
        include: { property: true },
      });
    });

    it('should return empty array when no property values', async () => {
      (prisma.propertyValue.findMany as jest.Mock).mockResolvedValue([]);

      const result = await service.findAll('record-123', 'user-123');

      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should return PropertyValueResponseDto for valid id', async () => {
      (prisma.propertyValue.findFirst as jest.Mock).mockResolvedValue(mockPropertyValueWithProperty);

      const result = await service.findOne('pv-123', 'user-123');

      expect(result.id).toBe('pv-123');
      expect(result.value).toBe('Hello');
      expect(prisma.propertyValue.findFirst).toHaveBeenCalledWith({
        where: { id: 'pv-123', record: { database: { space: { ownerId: 'user-123' } } } },
        include: { property: true },
      });
    });

    it('should throw NotFoundException when property value not found', async () => {
      (prisma.propertyValue.findFirst as jest.Mock).mockResolvedValue(null);

      await expect(service.findOne('nonexistent', 'user-123')).rejects.toThrow(NotFoundException);
      await expect(service.findOne('nonexistent', 'user-123')).rejects.toThrow(
        'PropertyValue with id nonexistent not found',
      );
    });
  });

  describe('update', () => {
    it('should update property value and return PropertyValueResponseDto', async () => {
      const updatedValue = { ...mockPropertyValue, value: 'Updated' };
      (prisma.propertyValue.findFirst as jest.Mock).mockResolvedValue(mockPropertyValueWithProperty);
      (prisma.propertyValue.update as jest.Mock).mockResolvedValue(updatedValue);

      const result = await service.update('pv-123', { value: 'Updated' }, 'user-123');

      expect(result.value).toBe('Updated');
      expect(prisma.propertyValue.findFirst).toHaveBeenCalledWith({
        where: { id: 'pv-123', record: { database: { space: { ownerId: 'user-123' } } } },
        include: { property: true },
      });
      expect(mockHandler.validateValue).toHaveBeenCalledWith('Updated', mockProperty.config);
      expect(mockHandler.formatValue).toHaveBeenCalledWith('Updated', mockProperty.config);
      expect(prisma.propertyValue.update).toHaveBeenCalledWith({
        where: { id: 'pv-123' },
        data: expect.objectContaining({ value: 'Updated' }),
      });
      expect(mockLogger.log).toHaveBeenCalledWith('Property value updated', { id: 'pv-123' });
    });

    it('should update only computed flag without value validation when value is undefined', async () => {
      (prisma.propertyValue.findFirst as jest.Mock).mockResolvedValue(mockPropertyValueWithProperty);
      (prisma.propertyValue.update as jest.Mock).mockResolvedValue({ ...mockPropertyValue, computed: true });

      await service.update('pv-123', { computed: true }, 'user-123');

      expect(mockHandler.validateValue).not.toHaveBeenCalled();
      expect(mockHandler.formatValue).not.toHaveBeenCalled();
      expect(prisma.propertyValue.update).toHaveBeenCalledWith({
        where: { id: 'pv-123' },
        data: { computed: true },
      });
    });

    it('should throw NotFoundException when property value not found', async () => {
      (prisma.propertyValue.findFirst as jest.Mock).mockResolvedValue(null);

      await expect(service.update('nonexistent', { value: 'Updated' }, 'user-123')).rejects.toThrow(NotFoundException);
      await expect(service.update('nonexistent', { value: 'Updated' }, 'user-123')).rejects.toThrow(
        'PropertyValue with id nonexistent not found',
      );
    });

    it('should throw BadRequestException when updated value is invalid', async () => {
      (prisma.propertyValue.findFirst as jest.Mock).mockResolvedValue(mockPropertyValueWithProperty);
      mockHandler.validateValue
        .mockReturnValueOnce(['Text value must be a string or null'])
        .mockReturnValueOnce(['Text value must be a string or null']);

      await expect(service.update('pv-123', { value: 999 }, 'user-123')).rejects.toThrow(BadRequestException);
      await expect(service.update('pv-123', { value: 999 }, 'user-123')).rejects.toThrow(
        'Invalid value for property type text',
      );
    });
  });

  describe('remove', () => {
    it('should delete property value and return PropertyValueResponseDto', async () => {
      (prisma.propertyValue.findFirst as jest.Mock).mockResolvedValue(mockPropertyValue);
      (prisma.propertyValue.delete as jest.Mock).mockResolvedValue(mockPropertyValue);

      const result = await service.remove('pv-123', 'user-123');

      expect(result.id).toBe('pv-123');
      expect(prisma.propertyValue.findFirst).toHaveBeenCalledWith({
        where: { id: 'pv-123', record: { database: { space: { ownerId: 'user-123' } } } },
      });
      expect(prisma.propertyValue.delete).toHaveBeenCalledWith({ where: { id: 'pv-123' } });
      expect(mockLogger.log).toHaveBeenCalledWith('Property value removed', { id: 'pv-123' });
    });

    it('should throw NotFoundException when property value not found', async () => {
      (prisma.propertyValue.findFirst as jest.Mock).mockResolvedValue(null);

      await expect(service.remove('nonexistent', 'user-123')).rejects.toThrow(NotFoundException);
      await expect(service.remove('nonexistent', 'user-123')).rejects.toThrow(
        'PropertyValue with id nonexistent not found',
      );
    });
  });
});
