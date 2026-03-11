import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { Test, TestingModule } from "@nestjs/testing";
import { DEFAULT_DATABASE_SETTINGS, DEFAULT_SECTION_SETTINGS, DEFAULT_SPACE_SETTINGS } from "@nucleus/domain";
import { SettingsController } from "../settings.controller";
import { SettingsService } from "../settings.service";

describe("SettingsController", () => {
  let controller: SettingsController;

  const mockSettingsService = {
    getSettings: jest.fn<any>(),
    updateSettings: jest.fn<any>(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [SettingsController],
      providers: [
        {
          provide: SettingsService,
          useValue: mockSettingsService,
        },
      ],
    }).compile();

    controller = module.get<SettingsController>(SettingsController);
  });

  describe("getSpaceSettings", () => {
    it("should call settingsService.getSettings with userId, space category and defaults", async () => {
      const mockResult = {
        ...DEFAULT_SPACE_SETTINGS,
      };
      mockSettingsService.getSettings.mockResolvedValue(mockResult);

      const result = await controller.getSpaceSettings("user-123");

      expect(result).toEqual(mockResult);
      expect(mockSettingsService.getSettings).toHaveBeenCalledWith("user-123", "space", DEFAULT_SPACE_SETTINGS);
      expect(mockSettingsService.getSettings).toHaveBeenCalledTimes(1);
    });
  });

  describe("updateSpaceSettings", () => {
    it("should call settingsService.updateSettings with userId, space category, dto and defaults", async () => {
      const dto = {
        sidebarCollapsed: true,
      };
      const mockResult = {
        ...DEFAULT_SPACE_SETTINGS,
        sidebarCollapsed: true,
      };
      mockSettingsService.updateSettings.mockResolvedValue(mockResult);

      const result = await controller.updateSpaceSettings("user-123", dto);

      expect(result).toEqual(mockResult);
      expect(mockSettingsService.updateSettings).toHaveBeenCalledWith("user-123", "space", dto, DEFAULT_SPACE_SETTINGS);
      expect(mockSettingsService.updateSettings).toHaveBeenCalledTimes(1);
    });
  });

  describe("getDatabaseSettings", () => {
    it("should call settingsService.getSettings with userId, database category and defaults", async () => {
      const mockResult = {
        ...DEFAULT_DATABASE_SETTINGS,
      };
      mockSettingsService.getSettings.mockResolvedValue(mockResult);

      const result = await controller.getDatabaseSettings("user-123");

      expect(result).toEqual(mockResult);
      expect(mockSettingsService.getSettings).toHaveBeenCalledWith("user-123", "database", DEFAULT_DATABASE_SETTINGS);
    });
  });

  describe("updateDatabaseSettings", () => {
    it("should call settingsService.updateSettings with userId, database category, dto and defaults", async () => {
      const dto = {
        defaultViewType: "table" as const,
      };
      const mockResult = {
        ...DEFAULT_DATABASE_SETTINGS,
        ...dto,
      };
      mockSettingsService.updateSettings.mockResolvedValue(mockResult);

      const result = await controller.updateDatabaseSettings("user-123", dto);

      expect(result).toEqual(mockResult);
      expect(mockSettingsService.updateSettings).toHaveBeenCalledWith(
        "user-123",
        "database",
        dto,
        DEFAULT_DATABASE_SETTINGS,
      );
    });
  });

  describe("getSectionSettings", () => {
    it("should call settingsService.getSettings with userId, section category and defaults", async () => {
      const mockResult = {
        ...DEFAULT_SECTION_SETTINGS,
      };
      mockSettingsService.getSettings.mockResolvedValue(mockResult);

      const result = await controller.getSectionSettings("user-123");

      expect(result).toEqual(mockResult);
      expect(mockSettingsService.getSettings).toHaveBeenCalledWith("user-123", "section", DEFAULT_SECTION_SETTINGS);
    });
  });

  describe("updateSectionSettings", () => {
    it("should call settingsService.updateSettings with userId, section category, dto and defaults", async () => {
      const dto = {
        defaultSectionIcon: "📁",
      };
      const mockResult = {
        ...DEFAULT_SECTION_SETTINGS,
        ...dto,
      };
      mockSettingsService.updateSettings.mockResolvedValue(mockResult);

      const result = await controller.updateSectionSettings("user-123", dto);

      expect(result).toEqual(mockResult);
      expect(mockSettingsService.updateSettings).toHaveBeenCalledWith(
        "user-123",
        "section",
        dto,
        DEFAULT_SECTION_SETTINGS,
      );
    });
  });
});
