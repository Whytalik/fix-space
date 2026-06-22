import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import type { TestingModule } from "@nestjs/testing";
import { Test } from "@nestjs/testing";
import { DEFAULT_DATABASE_SETTINGS, DEFAULT_SECTION_SETTINGS, DEFAULT_SPACE_SETTINGS } from "@fixspace/domain";
import { AppLogger } from "@/common/logger/app-logger.service";
import { SettingsService } from "../settings.service";
import { SettingsRepository } from "../repositories/settings.repository";
import { SettingsCategory } from "@fixspace/domain";

describe("SettingsService", () => {
  let service: SettingsService;

  const mockLogger = {
    setContext: jest.fn(),
    debug: jest.fn(),
    log: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  } as unknown as jest.Mocked<AppLogger>;

  const mockSettingsRepo = {
    findMany: jest.fn(),
    upsert: jest.fn(),
    deleteMany: jest.fn(),
    transaction: jest.fn().mockImplementation(async (callback: (tx: unknown) => Promise<unknown>) => callback({})),
  } as unknown as jest.Mocked<SettingsRepository>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SettingsService,
        { provide: AppLogger, useValue: mockLogger },
        { provide: SettingsRepository, useValue: mockSettingsRepo },
      ],
    }).compile();

    service = module.get<SettingsService>(SettingsService);
    jest.clearAllMocks();
  });

  describe("getSettings", () => {
    it("TC-SET-U-001: should return default values when no DB settings exist", async () => {
      mockSettingsRepo.findMany.mockResolvedValue([] as any);

      const result = await service.getSettings("u-1", SettingsCategory.DATABASE, DEFAULT_DATABASE_SETTINGS);

      expect(result).toEqual(DEFAULT_DATABASE_SETTINGS);
      expect(mockSettingsRepo.findMany).toHaveBeenCalledWith("u-1", SettingsCategory.DATABASE);
    });

    it("TC-SET-U-002: should merge DB settings over defaults", async () => {
      const overrideIcon = "custom-icon";
      mockSettingsRepo.findMany.mockResolvedValue([{ key: "defaultDatabaseIcon", value: overrideIcon }] as any);

      const result = await service.getSettings("u-1", SettingsCategory.DATABASE, DEFAULT_DATABASE_SETTINGS);

      expect(result.defaultDatabaseIcon).toBe(overrideIcon);
    });

    it("TC-SET-U-003: should ignore DB keys not present in defaults", async () => {
      mockSettingsRepo.findMany.mockResolvedValue([{ key: "unknownKey", value: "something" }] as any);

      const result = await service.getSettings("u-1", SettingsCategory.DATABASE, DEFAULT_DATABASE_SETTINGS);

      expect(result).toEqual(DEFAULT_DATABASE_SETTINGS);
      expect((result as any).unknownKey).toBeUndefined();
    });
  });

  describe("updateSettings", () => {
    it("TC-SET-U-004: should delete setting when value equals default", async () => {
      const defaultIcon = DEFAULT_DATABASE_SETTINGS.defaultDatabaseIcon;
      mockSettingsRepo.findMany.mockResolvedValue([] as any);

      await service.updateSettings("u-1", SettingsCategory.DATABASE, { defaultDatabaseIcon: defaultIcon }, DEFAULT_DATABASE_SETTINGS);

      expect(mockSettingsRepo.deleteMany).toHaveBeenCalledWith("u-1", "defaultDatabaseIcon", SettingsCategory.DATABASE, expect.anything());
      expect(mockSettingsRepo.upsert).not.toHaveBeenCalled();
    });

    it("TC-SET-U-005: should upsert setting when value differs from default", async () => {
      mockSettingsRepo.findMany.mockResolvedValue([] as any);

      await service.updateSettings("u-1", SettingsCategory.DATABASE, { defaultDatabaseIcon: "my-icon" }, DEFAULT_DATABASE_SETTINGS);

      expect(mockSettingsRepo.upsert).toHaveBeenCalledWith(
        "u-1",
        "defaultDatabaseIcon",
        SettingsCategory.DATABASE,
        "my-icon",
        expect.anything(),
      );
      expect(mockSettingsRepo.deleteMany).not.toHaveBeenCalled();
    });

    it("TC-SET-U-006: should return merged settings after update", async () => {
      mockSettingsRepo.findMany.mockResolvedValue([{ key: "defaultDatabaseIcon", value: "updated-icon" }] as any);

      const result = await service.updateSettings(
        "u-1",
        SettingsCategory.DATABASE,
        { defaultDatabaseIcon: "updated-icon" },
        DEFAULT_DATABASE_SETTINGS,
      );

      expect(result.defaultDatabaseIcon).toBe("updated-icon");
    });
  });

  describe("getDefaultIcon", () => {
    it("TC-SET-U-007: should return default database icon", async () => {
      mockSettingsRepo.findMany.mockResolvedValue([] as any);

      const icon = await service.getDefaultIcon("u-1", SettingsCategory.DATABASE);

      expect(icon).toBe(DEFAULT_DATABASE_SETTINGS.defaultDatabaseIcon);
    });

    it("TC-SET-U-008: should return default space icon", async () => {
      mockSettingsRepo.findMany.mockResolvedValue([] as any);

      const icon = await service.getDefaultIcon("u-1", SettingsCategory.SPACE);

      expect(icon).toBe(DEFAULT_SPACE_SETTINGS.defaultSpaceIcon);
    });
  });

  describe("resolveDefaults", () => {
    it("TC-SET-U-009: should use provided icon when given", async () => {
      const result = await service.resolveDefaults("u-1", SettingsCategory.DATABASE, { icon: "provided-icon" });

      expect(result.icon).toBe("provided-icon");
      expect(mockSettingsRepo.findMany).not.toHaveBeenCalled();
    });

    it("TC-SET-U-010: should fetch default icon when none provided", async () => {
      mockSettingsRepo.findMany.mockResolvedValue([] as any);

      const result = await service.resolveDefaults("u-1", SettingsCategory.DATABASE, {});

      expect(result.icon).toBe(DEFAULT_DATABASE_SETTINGS.defaultDatabaseIcon);
    });

    it("TC-SET-U-011: should resolve section color when category is SECTION and color not provided", async () => {
      mockSettingsRepo.findMany.mockResolvedValue([] as any);

      const result = await service.resolveDefaults("u-1", SettingsCategory.SECTION, { icon: "my-icon" });

      expect(result.icon).toBe("my-icon");
      expect(result.color).toBe(DEFAULT_SECTION_SETTINGS.defaultSectionColor);
    });
  });
});
