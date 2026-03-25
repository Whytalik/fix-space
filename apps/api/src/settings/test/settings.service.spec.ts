import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import type { TestingModule } from "@nestjs/testing";
import { Test } from "@nestjs/testing";
import { AppLogger } from "../../common/logger/app-logger.service";
import { SettingsCategory } from "../settings.constants";
import { SettingsRepository } from "../settings.repository";
import { SettingsService } from "../settings.service";

const mockLogger = {
  setContext: jest.fn<any>(),
  debug: jest.fn<any>(),
  log: jest.fn<any>(),
  warn: jest.fn<any>(),
  error: jest.fn<any>(),
};

const mockSettingsRepo = {
  findMany: jest.fn<any>(),
  upsert: jest.fn<any>(),
  deleteMany: jest.fn<any>(),
  runTransaction: jest.fn<any>().mockResolvedValue(undefined),
};

describe("SettingsService", () => {
  let service: SettingsService;

  const defaultValues = {
    theme: "light",
    sidebarCollapsed: false,
    sidebarWidth: 280,
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SettingsService,
        { provide: AppLogger, useValue: mockLogger },
        { provide: SettingsRepository, useValue: mockSettingsRepo },
      ],
    }).compile();

    service = module.get<SettingsService>(SettingsService);
  });

  describe("getSettings", () => {
    it("should return defaults when no settings exist in database", async () => {
      mockSettingsRepo.findMany.mockResolvedValue([]);

      const result = await service.getSettings("user-123", SettingsCategory.SPACE, defaultValues);

      expect(result).toEqual(defaultValues);
      expect(mockSettingsRepo.findMany).toHaveBeenCalledWith("user-123", SettingsCategory.SPACE);
    });

    it("should override defaults with values from database", async () => {
      mockSettingsRepo.findMany.mockResolvedValue([
        { key: "theme", value: "dark" },
        { key: "sidebarCollapsed", value: true },
      ]);

      const result = await service.getSettings("user-123", SettingsCategory.SPACE, defaultValues);

      expect(result).toEqual({
        theme: "dark",
        sidebarCollapsed: true,
        sidebarWidth: 280,
      });
    });

    it("should ignore unknown keys from database", async () => {
      mockSettingsRepo.findMany.mockResolvedValue([
        { key: "unknownKey", value: "some-value" },
        { key: "theme", value: "dark" },
      ]);

      const result = await service.getSettings("user-123", SettingsCategory.SPACE, defaultValues);

      expect(result).toEqual({
        theme: "dark",
        sidebarCollapsed: false,
        sidebarWidth: 280,
      });
      expect(result).not.toHaveProperty("unknownKey");
    });

    it("should return partial override when only some keys differ", async () => {
      mockSettingsRepo.findMany.mockResolvedValue([{ key: "sidebarWidth", value: 320 }]);

      const result = await service.getSettings("user-123", SettingsCategory.SPACE, defaultValues);

      expect(result.sidebarWidth).toBe(320);
      expect(result.theme).toBe("light");
      expect(result.sidebarCollapsed).toBe(false);
    });
  });

  describe("updateSettings", () => {
    it("should upsert values that differ from defaults", async () => {
      mockSettingsRepo.findMany.mockResolvedValue([{ key: "theme", value: "dark" }]);

      const result = await service.updateSettings("user-123", SettingsCategory.SPACE, { theme: "dark" }, defaultValues);

      expect(mockSettingsRepo.upsert).toHaveBeenCalledWith("user-123", "theme", SettingsCategory.SPACE, "dark");
      expect(result.theme).toBe("dark");
    });

    it("should delete settings when value equals default", async () => {
      mockSettingsRepo.findMany.mockResolvedValue([]);

      await service.updateSettings("user-123", SettingsCategory.SPACE, { theme: "light" }, defaultValues);

      expect(mockSettingsRepo.deleteMany).toHaveBeenCalledWith("user-123", "theme", SettingsCategory.SPACE);
      expect(mockSettingsRepo.upsert).not.toHaveBeenCalled();
    });

    it("should handle mixed updates: upsert non-defaults and delete defaults", async () => {
      mockSettingsRepo.findMany.mockResolvedValue([{ key: "sidebarCollapsed", value: true }]);

      await service.updateSettings(
        "user-123",
        SettingsCategory.SPACE,
        { theme: "light", sidebarCollapsed: true },
        defaultValues,
      );

      expect(mockSettingsRepo.deleteMany).toHaveBeenCalledWith("user-123", "theme", SettingsCategory.SPACE);
      expect(mockSettingsRepo.upsert).toHaveBeenCalledWith(
        "user-123",
        "sidebarCollapsed",
        SettingsCategory.SPACE,
        true,
      );
    });

    it("should return merged settings after update", async () => {
      mockSettingsRepo.findMany.mockResolvedValue([{ key: "sidebarWidth", value: 400 }]);

      const result = await service.updateSettings(
        "user-123",
        SettingsCategory.SPACE,
        { sidebarWidth: 400 },
        defaultValues,
      );

      expect(result.sidebarWidth).toBe(400);
      expect(result.theme).toBe("light");
    });
  });
});
