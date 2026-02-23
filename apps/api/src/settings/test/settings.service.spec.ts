import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { prisma } from '@nucleus/database';
import { SettingsService } from '../settings.service';

jest.mock('@nucleus/database', () => ({
  prisma: {
    settings: {
      findMany: jest.fn(),
      deleteMany: jest.fn(),
      upsert: jest.fn(),
    },
  },
}));

describe('SettingsService', () => {
  let service: SettingsService;

  const defaultValues = {
    theme: 'light',
    sidebarCollapsed: false,
    sidebarWidth: 280,
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [SettingsService],
    }).compile();

    service = module.get<SettingsService>(SettingsService);
  });

  describe('getSettings', () => {
    it('should return defaults when no settings exist in database', async () => {
      (prisma.settings.findMany as jest.Mock).mockResolvedValue([]);

      const result = await service.getSettings('user-123', 'space', defaultValues);

      expect(result).toEqual(defaultValues);
      expect(prisma.settings.findMany).toHaveBeenCalledWith({
        where: { userId: 'user-123', category: 'space' },
      });
    });

    it('should override defaults with values from database', async () => {
      (prisma.settings.findMany as jest.Mock).mockResolvedValue([
        { key: 'theme', value: 'dark' },
        { key: 'sidebarCollapsed', value: true },
      ]);

      const result = await service.getSettings('user-123', 'space', defaultValues);

      expect(result).toEqual({
        theme: 'dark',
        sidebarCollapsed: true,
        sidebarWidth: 280,
      });
    });

    it('should ignore unknown keys from database', async () => {
      (prisma.settings.findMany as jest.Mock).mockResolvedValue([
        { key: 'unknownKey', value: 'some-value' },
        { key: 'theme', value: 'dark' },
      ]);

      const result = await service.getSettings('user-123', 'space', defaultValues);

      expect(result).toEqual({
        theme: 'dark',
        sidebarCollapsed: false,
        sidebarWidth: 280,
      });
      expect(result).not.toHaveProperty('unknownKey');
    });

    it('should return partial override when only some keys differ', async () => {
      (prisma.settings.findMany as jest.Mock).mockResolvedValue([
        { key: 'sidebarWidth', value: 320 },
      ]);

      const result = await service.getSettings('user-123', 'space', defaultValues);

      expect(result.sidebarWidth).toBe(320);
      expect(result.theme).toBe('light');
      expect(result.sidebarCollapsed).toBe(false);
    });
  });

  describe('updateSettings', () => {
    it('should upsert values that differ from defaults', async () => {
      (prisma.settings.upsert as jest.Mock).mockResolvedValue({});
      (prisma.settings.findMany as jest.Mock).mockResolvedValue([
        { key: 'theme', value: 'dark' },
      ]);

      const result = await service.updateSettings(
        'user-123',
        'space',
        { theme: 'dark' },
        defaultValues,
      );

      expect(prisma.settings.upsert).toHaveBeenCalledWith({
        where: { userId_key: { userId: 'user-123', key: 'theme' } },
        update: { value: 'dark' },
        create: {
          userId: 'user-123',
          key: 'theme',
          value: 'dark',
          category: 'space',
        },
      });
      expect(result.theme).toBe('dark');
    });

    it('should delete settings when value equals default', async () => {
      (prisma.settings.deleteMany as jest.Mock).mockResolvedValue({ count: 1 });
      (prisma.settings.findMany as jest.Mock).mockResolvedValue([]);

      await service.updateSettings(
        'user-123',
        'space',
        { theme: 'light' },
        defaultValues,
      );

      expect(prisma.settings.deleteMany).toHaveBeenCalledWith({
        where: { userId: 'user-123', key: 'theme', category: 'space' },
      });
      expect(prisma.settings.upsert).not.toHaveBeenCalled();
    });

    it('should handle mixed updates: upsert non-defaults and delete defaults', async () => {
      (prisma.settings.upsert as jest.Mock).mockResolvedValue({});
      (prisma.settings.deleteMany as jest.Mock).mockResolvedValue({ count: 0 });
      (prisma.settings.findMany as jest.Mock).mockResolvedValue([
        { key: 'sidebarCollapsed', value: true },
      ]);

      await service.updateSettings(
        'user-123',
        'space',
        { theme: 'light', sidebarCollapsed: true },
        defaultValues,
      );

      // theme equals default → deleteMany
      expect(prisma.settings.deleteMany).toHaveBeenCalledWith({
        where: { userId: 'user-123', key: 'theme', category: 'space' },
      });
      // sidebarCollapsed differs from default → upsert
      expect(prisma.settings.upsert).toHaveBeenCalledWith(
        expect.objectContaining({ where: { userId_key: { userId: 'user-123', key: 'sidebarCollapsed' } } }),
      );
    });

    it('should return merged settings after update', async () => {
      (prisma.settings.upsert as jest.Mock).mockResolvedValue({});
      (prisma.settings.findMany as jest.Mock).mockResolvedValue([
        { key: 'sidebarWidth', value: 400 },
      ]);

      const result = await service.updateSettings(
        'user-123',
        'space',
        { sidebarWidth: 400 },
        defaultValues,
      );

      expect(result.sidebarWidth).toBe(400);
      expect(result.theme).toBe('light');
    });
  });
});
