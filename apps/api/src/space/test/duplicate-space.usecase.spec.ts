import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { prisma } from '@nucleus/database';
import { AppLogger } from '../../common/logger/app-logger.service';
import { SettingsService } from '../../settings/settings.service';
import { DuplicateSpaceUseCase } from '../providers/duplicate-space.usecase';

jest.mock('@nucleus/database', () => ({
  prisma: {
    space: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
    },
    $transaction: jest.fn(),
  },
}));

describe('DuplicateSpaceUseCase', () => {
  let useCase: DuplicateSpaceUseCase;

  const mockLogger = {
    setContext: jest.fn(),
    debug: jest.fn(),
    log: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  };

  const mockSettingsService = {
    getSettings: jest.fn(),
  };

  const mockSpaceSettings = {
    defaultDatabaseIcon: '📊',
    sidebarCollapsed: false,
  };

  const mockSourceSpace = {
    id: 'space-123',
    ownerId: 'user-123',
    name: 'Original Space',
    icon: '🚀',
    config: { some: 'config' },
    sections: [{ id: 'sec-1', name: 'Section 1', position: 0, icon: '📁', color: null }],
    databases: [
      {
        id: 'db-1',
        name: 'Tasks',
        title: 'Tasks',
        icon: '📊',
        sectionId: 'sec-1',
        config: null,
        properties: [
          {
            id: 'prop-1',
            name: 'Title',
            type: 'text',
            position: 0,
            icon: null,
            color: null,
            isRequired: true,
            isPrimary: true,
            config: null,
          },
        ],
        records: [
          {
            id: 'rec-1',
            name: 'Record 1',
            icon: null,
            config: null,
            values: [{ propertyId: 'prop-1', value: 'Hello', computed: null }],
            content: { config: { blocks: [] } },
          },
        ],
      },
    ],
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DuplicateSpaceUseCase,
        { provide: AppLogger, useValue: mockLogger },
        { provide: SettingsService, useValue: mockSettingsService },
      ],
    }).compile();

    useCase = module.get<DuplicateSpaceUseCase>(DuplicateSpaceUseCase);
  });

  it('should throw NotFoundException when source space not found', async () => {
    (prisma.space.findUnique as jest.Mock).mockResolvedValue(null);

    await expect(useCase.execute('nonexistent', 'user-123')).rejects.toThrow(NotFoundException);
    await expect(useCase.execute('nonexistent', 'user-123')).rejects.toThrow('Space with id nonexistent not found');
  });

  it('should duplicate space with custom name', async () => {
    (prisma.space.findUnique as jest.Mock).mockResolvedValue(mockSourceSpace);
    mockSettingsService.getSettings.mockResolvedValue(mockSpaceSettings);

    const newSpace = {
      id: 'space-new',
      name: 'Custom Name',
      icon: '🚀',
      ownerId: 'user-123',
    };
    const newSection = { id: 'sec-new' };
    const newDatabase = { id: 'db-new' };
    const newProperty = { id: 'prop-new' };
    const newRecord = { id: 'rec-new' };
    const resultSpace = {
      ...newSpace,
      sections: [{ ...newSection, name: 'Section 1' }],
    };

    const mockTx = {
      space: {
        create: jest.fn().mockResolvedValue(newSpace),
        findUnique: jest.fn().mockResolvedValue(resultSpace),
      },
      section: { create: jest.fn().mockResolvedValue(newSection) },
      database: { create: jest.fn().mockResolvedValue(newDatabase) },
      property: { create: jest.fn().mockResolvedValue(newProperty) },
      record: { create: jest.fn().mockResolvedValue(newRecord) },
      propertyValue: { create: jest.fn().mockResolvedValue({}) },
      recordContent: { create: jest.fn().mockResolvedValue({}) },
    };

    (prisma.$transaction as jest.Mock).mockImplementation(async (cb: (tx: typeof mockTx) => Promise<unknown>) =>
      cb(mockTx),
    );

    const result = await useCase.execute('space-123', 'user-123', {
      newName: 'Custom Name',
    });

    expect(result.id).toBe('space-new');
    expect(mockTx.space.create).toHaveBeenCalledWith({
      data: {
        name: 'Custom Name',
        icon: '🚀',
        ownerId: 'user-123',
        config: { some: 'config' },
      },
    });
    expect(mockTx.section.create).toHaveBeenCalledTimes(1);
    expect(mockTx.database.create).toHaveBeenCalledTimes(1);
    expect(mockTx.property.create).toHaveBeenCalledTimes(1);
    expect(mockTx.record.create).toHaveBeenCalledTimes(1);
    expect(mockTx.propertyValue.create).toHaveBeenCalledTimes(1);
    expect(mockTx.recordContent.create).toHaveBeenCalledTimes(1);
  });

  it('should generate unique name when no custom name provided', async () => {
    (prisma.space.findUnique as jest.Mock).mockResolvedValue(mockSourceSpace);
    (prisma.space.findMany as jest.Mock).mockResolvedValue([{ name: 'Original Space' }]);
    mockSettingsService.getSettings.mockResolvedValue(mockSpaceSettings);

    const newSpace = {
      id: 'space-new',
      name: 'Original Space (Copy)',
      icon: '🚀',
      ownerId: 'user-123',
    };
    const resultSpace = { ...newSpace, sections: [] };
    const mockTx = {
      space: {
        create: jest.fn().mockResolvedValue(newSpace),
        findUnique: jest.fn().mockResolvedValue(resultSpace),
      },
      section: { create: jest.fn().mockResolvedValue({ id: 'sec-new' }) },
      database: { create: jest.fn().mockResolvedValue({ id: 'db-new' }) },
      property: { create: jest.fn().mockResolvedValue({ id: 'prop-new' }) },
      record: { create: jest.fn().mockResolvedValue({ id: 'rec-new' }) },
      propertyValue: { create: jest.fn().mockResolvedValue({}) },
      recordContent: { create: jest.fn().mockResolvedValue({}) },
    };

    (prisma.$transaction as jest.Mock).mockImplementation(async (cb: (tx: typeof mockTx) => Promise<unknown>) =>
      cb(mockTx),
    );

    await useCase.execute('space-123', 'user-123');

    expect(mockTx.space.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ name: 'Original Space (Copy)' }),
      }),
    );
  });

  it('should generate unique name with counter when Copy exists', async () => {
    (prisma.space.findUnique as jest.Mock).mockResolvedValue(mockSourceSpace);
    (prisma.space.findMany as jest.Mock).mockResolvedValue([
      { name: 'Original Space' },
      { name: 'Original Space (Copy)' },
    ]);
    mockSettingsService.getSettings.mockResolvedValue(mockSpaceSettings);

    const newSpace = {
      id: 'space-new',
      name: 'Original Space (Copy 2)',
      icon: '🚀',
      ownerId: 'user-123',
    };
    const resultSpace = { ...newSpace, sections: [] };
    const mockTx = {
      space: {
        create: jest.fn().mockResolvedValue(newSpace),
        findUnique: jest.fn().mockResolvedValue(resultSpace),
      },
      section: { create: jest.fn().mockResolvedValue({ id: 'sec-new' }) },
      database: { create: jest.fn().mockResolvedValue({ id: 'db-new' }) },
      property: { create: jest.fn().mockResolvedValue({ id: 'prop-new' }) },
      record: { create: jest.fn().mockResolvedValue({ id: 'rec-new' }) },
      propertyValue: { create: jest.fn().mockResolvedValue({}) },
      recordContent: { create: jest.fn().mockResolvedValue({}) },
    };

    (prisma.$transaction as jest.Mock).mockImplementation(async (cb: (tx: typeof mockTx) => Promise<unknown>) =>
      cb(mockTx),
    );

    await useCase.execute('space-123', 'user-123');

    expect(mockTx.space.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ name: 'Original Space (Copy 2)' }),
      }),
    );
  });

  it('should use space settings as fallback when source config is null', async () => {
    const spaceWithoutConfig = {
      ...mockSourceSpace,
      config: null,
      sections: [],
      databases: [],
    };
    (prisma.space.findUnique as jest.Mock).mockResolvedValue(spaceWithoutConfig);
    mockSettingsService.getSettings.mockResolvedValue(mockSpaceSettings);

    const newSpace = {
      id: 'space-new',
      name: 'Copy',
      icon: '🚀',
      ownerId: 'user-123',
    };
    const resultSpace = { ...newSpace, sections: [] };
    const mockTx = {
      space: {
        create: jest.fn().mockResolvedValue(newSpace),
        findUnique: jest.fn().mockResolvedValue(resultSpace),
      },
      section: { create: jest.fn() },
      database: { create: jest.fn() },
      property: { create: jest.fn() },
      record: { create: jest.fn() },
      propertyValue: { create: jest.fn() },
      recordContent: { create: jest.fn() },
    };

    (prisma.$transaction as jest.Mock).mockImplementation(async (cb: (tx: typeof mockTx) => Promise<unknown>) =>
      cb(mockTx),
    );

    await useCase.execute('space-123', 'user-123', { newName: 'Copy' });

    expect(mockTx.space.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ config: mockSpaceSettings }),
    });
  });

  it('should map section IDs correctly for database duplication', async () => {
    (prisma.space.findUnique as jest.Mock).mockResolvedValue(mockSourceSpace);
    mockSettingsService.getSettings.mockResolvedValue(mockSpaceSettings);

    const newSpace = { id: 'space-new' };
    const newSection = { id: 'sec-new' };
    const newDatabase = { id: 'db-new' };
    const resultSpace = { ...newSpace, sections: [] };

    const mockTx = {
      space: {
        create: jest.fn().mockResolvedValue(newSpace),
        findUnique: jest.fn().mockResolvedValue(resultSpace),
      },
      section: { create: jest.fn().mockResolvedValue(newSection) },
      database: { create: jest.fn().mockResolvedValue(newDatabase) },
      property: { create: jest.fn().mockResolvedValue({ id: 'prop-new' }) },
      record: { create: jest.fn().mockResolvedValue({ id: 'rec-new' }) },
      propertyValue: { create: jest.fn().mockResolvedValue({}) },
      recordContent: { create: jest.fn().mockResolvedValue({}) },
    };

    (prisma.$transaction as jest.Mock).mockImplementation(async (cb: (tx: typeof mockTx) => Promise<unknown>) =>
      cb(mockTx),
    );

    await useCase.execute('space-123', 'user-123', { newName: 'Copy' });

    // Database should use the mapped section ID (sec-new instead of sec-1)
    expect(mockTx.database.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ sectionId: 'sec-new' }),
    });
  });

  it('should log duplication summary', async () => {
    (prisma.space.findUnique as jest.Mock).mockResolvedValue({
      ...mockSourceSpace,
      sections: [],
      databases: [],
    });
    mockSettingsService.getSettings.mockResolvedValue(mockSpaceSettings);

    const newSpace = { id: 'space-new' };
    const resultSpace = { ...newSpace, sections: [] };
    const mockTx = {
      space: {
        create: jest.fn().mockResolvedValue(newSpace),
        findUnique: jest.fn().mockResolvedValue(resultSpace),
      },
      section: { create: jest.fn() },
      database: { create: jest.fn() },
      property: { create: jest.fn() },
      record: { create: jest.fn() },
      propertyValue: { create: jest.fn() },
      recordContent: { create: jest.fn() },
    };

    (prisma.$transaction as jest.Mock).mockImplementation(async (cb: (tx: typeof mockTx) => Promise<unknown>) =>
      cb(mockTx),
    );

    await useCase.execute('space-123', 'user-123', { newName: 'Copy' });

    expect(mockLogger.log).toHaveBeenCalledWith('Space duplicated', {
      sourceSpaceId: 'space-123',
      newSpaceId: 'space-new',
      ownerId: 'user-123',
    });
  });
});
