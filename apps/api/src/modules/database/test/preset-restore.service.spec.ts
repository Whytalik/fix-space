import { BadRequestException, ConflictException, NotFoundException } from "@nestjs/common";
import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import type { TestingModule } from "@nestjs/testing";
import { Test } from "@nestjs/testing";
import { PropertyType } from "@fixspace/domain";
import type { DatabaseType } from "@fixspace/domain";
import { AppLogger } from "@/common/logger/app-logger.service";
import { InitializationConfigService } from "@/core/config/initialization/initialization-config.service";
import { PropertyService } from "@/modules/property/property.service";
import { PropertyRepository } from "@/modules/property/repositories/property.repository";
import { SpaceRepository } from "@/modules/space/repositories/space.repository";
import { TemplateService } from "@/modules/template/template.service";
import { ViewService } from "@/modules/view/view.service";
import { DatabaseService } from "../database.service";
import { PresetRestoreService } from "../providers/preset-restore.service";
import { DatabaseRepository } from "../repositories/database.repository";

describe("PresetRestoreService", () => {
  let service: PresetRestoreService;

  const mockLogger: jest.Mocked<AppLogger> = {
    setContext: jest.fn(),
    debug: jest.fn(),
    log: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  } as unknown as jest.Mocked<AppLogger>;

  const mockInitConfig = {
    getConfig: jest.fn(),
  };

  const mockDatabaseService = {
    create: jest.fn(),
  };

  const mockPropertyService = {
    create: jest.fn(),
  };

  const mockTemplateService = {
    create: jest.fn(),
  };

  const mockViewService = {
    create: jest.fn(),
  };

  const mockDatabaseRepo = {
    findByTypeForOwner: jest.fn(),
  };

  const mockPropertyRepo = {
    findManyByDatabase: jest.fn(),
  };

  const mockSpaceRepo = {
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PresetRestoreService,
        { provide: AppLogger, useValue: mockLogger },
        { provide: InitializationConfigService, useValue: mockInitConfig },
        { provide: DatabaseService, useValue: mockDatabaseService },
        { provide: PropertyService, useValue: mockPropertyService },
        { provide: TemplateService, useValue: mockTemplateService },
        { provide: ViewService, useValue: mockViewService },
        { provide: DatabaseRepository, useValue: mockDatabaseRepo },
        { provide: PropertyRepository, useValue: mockPropertyRepo },
        { provide: SpaceRepository, useValue: mockSpaceRepo },
      ],
    }).compile();

    service = module.get<PresetRestoreService>(PresetRestoreService);

    jest.clearAllMocks();
  });

  const mockConfig = {
    databases: [
      {
        type: "trading-journal",
        title: "Trading Journal",
        name: "trading-journal",
        icon: "icon:BookOpen",
        properties: [
          { name: "Name", type: PropertyType.TEXT, position: 0 },
          { name: "Symbol", type: PropertyType.TEXT, position: 1 },
          { name: "Formula", type: PropertyType.FORMULA, position: 2, config: { expression: "{{Symbol}}" } },
        ],
        views: [{ name: "All Trades", type: "table", filters: [{ propertyName: "Name", operator: "is_not_empty" }] }],
        templates: [{ name: "New Trade" }],
      },
    ],
  };

  describe("getAvailablePresetTypes", () => {
    it("TC-PRESET-U-001: should return preset types that do not exist for the user", async () => {
      mockInitConfig.getConfig.mockReturnValue(mockConfig);
      mockDatabaseRepo.findByTypeForOwner.mockResolvedValue(null);

      const result = await service.getAvailablePresetTypes("user-1");

      expect(result).toHaveLength(1);
      expect(result[0].type).toBe("trading-journal");
      expect(mockDatabaseRepo.findByTypeForOwner).toHaveBeenCalledWith("trading-journal", "user-1");
    });

    it("TC-PRESET-U-002: should return empty array if all presets exist", async () => {
      mockInitConfig.getConfig.mockReturnValue(mockConfig);
      mockDatabaseRepo.findByTypeForOwner.mockResolvedValue({ id: "db-1" });

      const result = await service.getAvailablePresetTypes("user-1");

      expect(result).toHaveLength(0);
    });
  });

  describe("restore", () => {
    it("TC-PRESET-U-003: should throw BadRequestException for unknown type", async () => {
      mockInitConfig.getConfig.mockReturnValue(mockConfig);

      await expect(service.restore("user-1", "unknown" as any, "space-1")).rejects.toThrow(BadRequestException);
    });

    it("TC-PRESET-U-004: should throw ConflictException if database already exists", async () => {
      mockInitConfig.getConfig.mockReturnValue(mockConfig);
      mockDatabaseRepo.findByTypeForOwner.mockResolvedValue({ id: "db-1" });

      await expect(service.restore("user-1", "trading-journal" as DatabaseType, "space-1")).rejects.toThrow(ConflictException);
    });

    it("TC-PRESET-U-005: should throw NotFoundException if space not found or not owned", async () => {
      mockInitConfig.getConfig.mockReturnValue(mockConfig);
      mockDatabaseRepo.findByTypeForOwner.mockResolvedValue(null);
      mockSpaceRepo.findOne.mockResolvedValue(null);

      await expect(service.restore("user-1", "trading-journal" as DatabaseType, "space-1")).rejects.toThrow(NotFoundException);
    });

    it("TC-PRESET-U-006: should restore database with properties, templates, and views", async () => {
      mockInitConfig.getConfig.mockReturnValue(mockConfig);
      mockDatabaseRepo.findByTypeForOwner.mockResolvedValue(null);
      mockSpaceRepo.findOne.mockResolvedValue({ id: "space-1", ownerId: "user-1" });
      mockDatabaseService.create.mockResolvedValue({ id: "new-db-1", title: "Trading Journal" });

      mockPropertyService.create
        .mockResolvedValueOnce({ id: "prop-id-1", name: "Name" })
        .mockResolvedValueOnce({ id: "prop-id-2", name: "Symbol" })
        .mockResolvedValueOnce({ id: "prop-id-3", name: "Formula" });

      mockPropertyRepo.findManyByDatabase.mockResolvedValue([
        { id: "prop-id-1", name: "Name" },
        { id: "prop-id-2", name: "Symbol" },
        { id: "prop-id-3", name: "Formula" },
      ]);

      const result = await service.restore("user-1", "trading-journal" as DatabaseType, "space-1");

      expect(result.id).toBe("new-db-1");
      expect(mockDatabaseService.create).toHaveBeenCalled();
      expect(mockPropertyService.create).toHaveBeenCalledTimes(3);
      expect(mockTemplateService.create).toHaveBeenCalledTimes(1);
      expect(mockViewService.create).toHaveBeenCalledTimes(1);

      expect(mockPropertyService.create).toHaveBeenLastCalledWith(
        "new-db-1",
        expect.objectContaining({
          name: "Formula",
          config: expect.objectContaining({
            expression: "field_prop_id_2",
          }),
        }),
        "user-1",
      );

      expect(mockViewService.create).toHaveBeenCalledWith(
        "new-db-1",
        expect.objectContaining({
          filters: [expect.objectContaining({ propertyId: "prop-id-1" })],
        }),
        "user-1",
      );
    });
  });
});
