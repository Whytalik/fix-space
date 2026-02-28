import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { prisma } from '@nucleus/database';
import { AppLogger } from '../../common/logger/app-logger.service';
import { SettingsService } from '../../settings/settings.service';
import { SectionService } from '../providers/section.service';
import { SpaceService } from '../space.service';

jest.mock('@nucleus/database', () => ({
  prisma: {
    space: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    $transaction: jest.fn(),
  },
}));

describe('SpaceService', () => {
  let service: SpaceService;

  const mockLogger = {
    setContext: jest.fn(),
    debug: jest.fn(),
    log: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  };

  const mockSectionService = {
    processOperations: jest.fn(),
  };

  const mockSettingsService = {
    getSettings: jest.fn(),
  };

  const mockSpaceSettings = {
    defaultDatabaseIcon: '📊',
    defaultSectionIcon: '📁',
    sidebarCollapsed: false,
    sidebarWidth: 280,
  };

  const mockSpace = {
    id: 'space-123',
    ownerId: 'user-123',
    name: 'Test Space',
    icon: '🚀',
    createdAt: new Date('2024-01-01'),
    config: null,
    sections: [],
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SpaceService,
        { provide: AppLogger, useValue: mockLogger },
        { provide: SectionService, useValue: mockSectionService },
        { provide: SettingsService, useValue: mockSettingsService },
      ],
    }).compile();

    service = module.get<SpaceService>(SpaceService);
  });

  describe('create', () => {
    it('should create a space and return SpaceResponseDto', async () => {
      mockSettingsService.getSettings.mockResolvedValue(mockSpaceSettings);
      (prisma.space.create as jest.Mock).mockResolvedValue(mockSpace);

      const result = await service.create('user-123', {
        name: 'Test Space',
        icon: '🚀',
      });

      expect(result.id).toBe('space-123');
      expect(result.name).toBe('Test Space');
      expect(mockSettingsService.getSettings).toHaveBeenCalledWith('user-123', 'space', expect.any(Object));
      expect(prisma.space.create).toHaveBeenCalledWith({
        data: {
          name: 'Test Space',
          icon: '🚀',
          ownerId: 'user-123',
          config: mockSpaceSettings,
        },
        include: { sections: { orderBy: { position: 'asc' } } },
      });
      expect(mockLogger.log).toHaveBeenCalledWith('Space created', {
        spaceId: 'space-123',
        ownerId: 'user-123',
      });
    });

    it('should throw BadRequestException on duplicate name (P2002)', async () => {
      mockSettingsService.getSettings.mockResolvedValue(mockSpaceSettings);
      const prismaError = Object.assign(new Error('Unique constraint'), {
        code: 'P2002',
      });
      (prisma.space.create as jest.Mock).mockRejectedValue(prismaError);

      await expect(service.create('user-123', { name: 'Duplicate' })).rejects.toThrow(BadRequestException);
      await expect(service.create('user-123', { name: 'Duplicate' })).rejects.toThrow(
        'Space with this name already exists for the owner',
      );
    });

    it('should rethrow unknown errors', async () => {
      mockSettingsService.getSettings.mockResolvedValue(mockSpaceSettings);
      (prisma.space.create as jest.Mock).mockRejectedValue(new Error('DB error'));

      await expect(service.create('user-123', { name: 'Test' })).rejects.toThrow('DB error');
    });
  });

  describe('findAll', () => {
    it('should return array of SpaceResponseDto for owner', async () => {
      const spaces = [mockSpace, { ...mockSpace, id: 'space-456', name: 'Space 2' }];
      (prisma.space.findMany as jest.Mock).mockResolvedValue(spaces);

      const result = await service.findAll('user-123');

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('space-123');
      expect(result[1].id).toBe('space-456');
      expect(prisma.space.findMany).toHaveBeenCalledWith({
        where: { ownerId: 'user-123' },
        include: { sections: { orderBy: { position: 'asc' } } },
      });
    });

    it('should return empty array when no spaces', async () => {
      (prisma.space.findMany as jest.Mock).mockResolvedValue([]);

      const result = await service.findAll('user-123');

      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should return SpaceResponseDto for valid id', async () => {
      (prisma.space.findUnique as jest.Mock).mockResolvedValue(mockSpace);

      const result = await service.findOne('space-123');

      expect(result.id).toBe('space-123');
      expect(result.name).toBe('Test Space');
      expect(prisma.space.findUnique).toHaveBeenCalledWith({
        where: { id: 'space-123' },
        include: { sections: { orderBy: { position: 'asc' } } },
      });
    });

    it('should throw NotFoundException when space not found', async () => {
      (prisma.space.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.findOne('nonexistent')).rejects.toThrow(NotFoundException);
      await expect(service.findOne('nonexistent')).rejects.toThrow('Space with id nonexistent not found');
    });
  });

  describe('update', () => {
    it('should update space name and return SpaceResponseDto', async () => {
      const updatedSpace = { ...mockSpace, name: 'Updated Name' };
      const mockTx = {
        space: {
          update: jest.fn<() => Promise<typeof updatedSpace>>().mockResolvedValue(updatedSpace),
        },
      };
      (prisma.$transaction as jest.Mock).mockImplementation(async (cb: (tx: typeof mockTx) => Promise<unknown>) =>
        cb(mockTx),
      );

      const result = await service.update('space-123', {
        name: 'Updated Name',
      });

      expect(result.name).toBe('Updated Name');
      expect(mockTx.space.update).toHaveBeenCalledWith({
        where: { id: 'space-123' },
        data: { name: 'Updated Name', icon: undefined },
        include: { sections: { orderBy: { position: 'asc' } } },
      });
    });

    it('should process section operations before updating space', async () => {
      const mockTx = {
        space: {
          update: jest.fn<() => Promise<typeof mockSpace>>().mockResolvedValue(mockSpace),
        },
      };
      (prisma.$transaction as jest.Mock).mockImplementation(async (cb: (tx: typeof mockTx) => Promise<unknown>) =>
        cb(mockTx),
      );

      const sectionOps = [{ operation: 'CREATE' as const, create: { name: 'New Section' } }];

      await service.update('space-123', {
        name: 'Test',
        sectionOperations: sectionOps as any,
      });

      expect(mockSectionService.processOperations).toHaveBeenCalledWith(mockTx, 'space-123', sectionOps);
    });

    it('should not process section operations when empty', async () => {
      const mockTx = {
        space: {
          update: jest.fn<() => Promise<typeof mockSpace>>().mockResolvedValue(mockSpace),
        },
      };
      (prisma.$transaction as jest.Mock).mockImplementation(async (cb: (tx: typeof mockTx) => Promise<unknown>) =>
        cb(mockTx),
      );

      await service.update('space-123', { name: 'Test' });

      expect(mockSectionService.processOperations).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException on P2025', async () => {
      const prismaError = Object.assign(new Error('Not found'), {
        code: 'P2025',
      });
      const mockTx = {
        space: { update: jest.fn().mockRejectedValue(prismaError) },
      };
      (prisma.$transaction as jest.Mock).mockImplementation(async (cb: (tx: typeof mockTx) => Promise<unknown>) =>
        cb(mockTx),
      );

      await expect(service.update('nonexistent', { name: 'Test' })).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException on duplicate name (P2002)', async () => {
      const prismaError = Object.assign(new Error('Unique'), { code: 'P2002' });
      const mockTx = {
        space: { update: jest.fn().mockRejectedValue(prismaError) },
      };
      (prisma.$transaction as jest.Mock).mockImplementation(async (cb: (tx: typeof mockTx) => Promise<unknown>) =>
        cb(mockTx),
      );

      await expect(service.update('space-123', { name: 'Duplicate' })).rejects.toThrow(BadRequestException);
    });
  });

  describe('remove', () => {
    it('should delete space and return SpaceResponseDto', async () => {
      (prisma.space.delete as jest.Mock).mockResolvedValue(mockSpace);

      const result = await service.remove('space-123');

      expect(result.id).toBe('space-123');
      expect(prisma.space.delete).toHaveBeenCalledWith({
        where: { id: 'space-123' },
      });
      expect(mockLogger.log).toHaveBeenCalledWith('Space removed', {
        id: 'space-123',
      });
    });

    it('should throw NotFoundException on P2025', async () => {
      const prismaError = Object.assign(new Error('Not found'), {
        code: 'P2025',
      });
      (prisma.space.delete as jest.Mock).mockRejectedValue(prismaError);

      await expect(service.remove('nonexistent')).rejects.toThrow(NotFoundException);
    });

    it('should rethrow unknown errors', async () => {
      (prisma.space.delete as jest.Mock).mockRejectedValue(new Error('DB error'));

      await expect(service.remove('space-123')).rejects.toThrow('DB error');
    });
  });
});
