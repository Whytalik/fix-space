import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { prisma } from '@nucleus/database';
import { SectionOperationType } from '@nucleus/domain';
import { AppLogger } from '../../common/logger/app-logger.service';
import { SectionService } from '../providers/section.service';

jest.mock('@nucleus/database', () => ({
  prisma: {
    section: {
      create: jest.fn(),
    },
  },
}));

describe('SectionService', () => {
  let service: SectionService;

  const mockLogger = {
    setContext: jest.fn(),
    debug: jest.fn(),
    log: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  };

  const mockSection = {
    id: 'section-123',
    spaceId: 'space-123',
    name: 'Test Section',
    position: 0,
    icon: '📁',
    color: null,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [SectionService, { provide: AppLogger, useValue: mockLogger }],
    }).compile();

    service = module.get<SectionService>(SectionService);
  });

  describe('create', () => {
    it('should create a section and return SectionResponseDto', async () => {
      (prisma.section.create as jest.Mock).mockResolvedValue(mockSection);

      const result = await service.create('space-123', {
        name: 'Test Section',
        position: 0,
        icon: '📁',
      });

      expect(result.id).toBe('section-123');
      expect(result.name).toBe('Test Section');
      expect(prisma.section.create).toHaveBeenCalledWith({
        data: {
          name: 'Test Section',
          position: 0,
          icon: '📁',
          color: undefined,
          spaceId: 'space-123',
        },
      });
      expect(mockLogger.log).toHaveBeenCalledWith('Section created', {
        sectionId: 'section-123',
        spaceId: 'space-123',
      });
    });

    it('should throw NotFoundException when space not found (P2003)', async () => {
      const prismaError = Object.assign(new Error('Foreign key'), {
        code: 'P2003',
      });
      (prisma.section.create as jest.Mock).mockRejectedValue(prismaError);

      await expect(service.create('nonexistent', { name: 'Test' })).rejects.toThrow(NotFoundException);
      await expect(service.create('nonexistent', { name: 'Test' })).rejects.toThrow(
        'Space with id nonexistent not found',
      );
    });

    it('should rethrow unknown errors', async () => {
      (prisma.section.create as jest.Mock).mockRejectedValue(new Error('DB error'));

      await expect(service.create('space-123', { name: 'Test' })).rejects.toThrow('DB error');
    });
  });

  describe('processOperations', () => {
    const mockTx = {
      section: {
        create: jest.fn(),
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    };

    beforeEach(() => {
      jest.clearAllMocks();
    });

    describe('CREATE operation', () => {
      it('should create a section via transaction', async () => {
        mockTx.section.create.mockResolvedValue(mockSection);

        await service.processOperations(mockTx as any, 'space-123', [
          {
            operation: SectionOperationType.CREATE,
            create: { name: 'New Section', position: 1, icon: '📁' },
          },
        ]);

        expect(mockTx.section.create).toHaveBeenCalledWith({
          data: {
            name: 'New Section',
            position: 1,
            icon: '📁',
            color: undefined,
            spaceId: 'space-123',
          },
        });
      });

      it('should throw BadRequestException when create field is missing', async () => {
        await expect(
          service.processOperations(mockTx as any, 'space-123', [{ operation: SectionOperationType.CREATE }]),
        ).rejects.toThrow(BadRequestException);
      });
    });

    describe('UPDATE operation', () => {
      it('should update a section via transaction', async () => {
        mockTx.section.findUnique.mockResolvedValue(mockSection);
        mockTx.section.findFirst.mockResolvedValue(null);
        mockTx.section.update.mockResolvedValue({
          ...mockSection,
          name: 'Updated',
        });

        await service.processOperations(mockTx as any, 'space-123', [
          {
            operation: SectionOperationType.UPDATE,
            id: 'section-123',
            update: { name: 'Updated' },
          },
        ]);

        expect(mockTx.section.update).toHaveBeenCalledWith({
          where: { id: 'section-123' },
          data: {
            name: 'Updated',
            position: undefined,
            icon: undefined,
            color: undefined,
          },
        });
      });

      it('should throw BadRequestException when id is missing', async () => {
        await expect(
          service.processOperations(mockTx as any, 'space-123', [{ operation: SectionOperationType.UPDATE }]),
        ).rejects.toThrow('UPDATE operation requires "id" field');
      });

      it('should throw NotFoundException when section not found', async () => {
        mockTx.section.findUnique.mockResolvedValue(null);

        await expect(
          service.processOperations(mockTx as any, 'space-123', [
            { operation: SectionOperationType.UPDATE, id: 'nonexistent' },
          ]),
        ).rejects.toThrow(NotFoundException);
      });

      it('should throw BadRequestException when section belongs to different space', async () => {
        mockTx.section.findUnique.mockResolvedValue({
          ...mockSection,
          spaceId: 'other-space',
        });

        await expect(
          service.processOperations(mockTx as any, 'space-123', [
            { operation: SectionOperationType.UPDATE, id: 'section-123' },
          ]),
        ).rejects.toThrow(BadRequestException);
      });

      it('should throw BadRequestException on duplicate section name', async () => {
        mockTx.section.findUnique.mockResolvedValue(mockSection);
        mockTx.section.findFirst.mockResolvedValue({
          id: 'other-section',
          name: 'Duplicate',
        });

        await expect(
          service.processOperations(mockTx as any, 'space-123', [
            {
              operation: SectionOperationType.UPDATE,
              id: 'section-123',
              update: { name: 'Duplicate' },
            },
          ]),
        ).rejects.toThrow('Section with name "Duplicate" already exists in this space');
      });
    });

    describe('DELETE operation', () => {
      it('should delete a section via transaction', async () => {
        mockTx.section.findUnique.mockResolvedValue(mockSection);
        mockTx.section.delete.mockResolvedValue(mockSection);

        await service.processOperations(mockTx as any, 'space-123', [
          { operation: SectionOperationType.DELETE, id: 'section-123' },
        ]);

        expect(mockTx.section.delete).toHaveBeenCalledWith({
          where: { id: 'section-123' },
        });
        expect(mockLogger.log).toHaveBeenCalledWith('Section deleted', {
          sectionId: 'section-123',
          spaceId: 'space-123',
        });
      });

      it('should throw BadRequestException when id is missing', async () => {
        await expect(
          service.processOperations(mockTx as any, 'space-123', [{ operation: SectionOperationType.DELETE }]),
        ).rejects.toThrow('DELETE operation requires "id" field');
      });

      it('should throw NotFoundException when section not found', async () => {
        mockTx.section.findUnique.mockResolvedValue(null);

        await expect(
          service.processOperations(mockTx as any, 'space-123', [
            { operation: SectionOperationType.DELETE, id: 'nonexistent' },
          ]),
        ).rejects.toThrow(NotFoundException);
      });

      it('should throw BadRequestException when section belongs to different space', async () => {
        mockTx.section.findUnique.mockResolvedValue({
          ...mockSection,
          spaceId: 'other-space',
        });

        await expect(
          service.processOperations(mockTx as any, 'space-123', [
            { operation: SectionOperationType.DELETE, id: 'section-123' },
          ]),
        ).rejects.toThrow(BadRequestException);
      });
    });

    it('should process multiple operations in order', async () => {
      const callOrder: string[] = [];
      mockTx.section.create.mockImplementation(async () => {
        callOrder.push('create');
        return mockSection;
      });
      mockTx.section.findUnique.mockResolvedValue(mockSection);
      mockTx.section.delete.mockImplementation(async () => {
        callOrder.push('delete');
        return mockSection;
      });

      await service.processOperations(mockTx as any, 'space-123', [
        { operation: SectionOperationType.CREATE, create: { name: 'New' } },
        { operation: SectionOperationType.DELETE, id: 'section-123' },
      ]);

      expect(callOrder).toEqual(['create', 'delete']);
    });
  });
});
