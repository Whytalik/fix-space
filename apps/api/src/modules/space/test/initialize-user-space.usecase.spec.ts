import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import type { TestingModule } from "@nestjs/testing";
import { Test } from "@nestjs/testing";
import { AppLogger } from "@/common/logger/app-logger.service";
import { DatabaseService } from "@/modules/database/database.service";
import { PropertyRepository } from "@/modules/property/repositories/property.repository";
import { PropertyService } from "@/modules/property/property.service";
import { PropertyValueRepository } from "@/modules/property-value/repositories/property-value.repository";
import { RecordRepository } from "@/modules/record/repositories/record.repository";
import { TemplateService } from "@/modules/template/template.service";
import { SpaceRepository } from "../repositories/space.repository";
import { SectionService } from "../providers/section.service";
import { SpaceService } from "../space.service";
import { InitializeUserSpaceUseCase } from "../providers/initialize-user-space.usecase";
import { InitializationConfigService } from "@/core/config/initialization/initialization-config.service";
import { PropertyType } from "@fixspace/domain";
import type { InitializationConfig } from "@/core/config/initialization/types";

jest.mock("@fixspace/database", () => ({
  Prisma: {
    DbNull: "DbNull",
  },
  prisma: {
    $transaction: jest.fn((callback: (tx: unknown) => unknown) => callback(prisma)),
  },
}));

const mockConfig: InitializationConfig = {
  spaceIcon: "🏠",
  sections: [
    { name: "Trading", position: 0, icon: "📊", color: "#3b82f6", key: "trading" },
    { name: "Analytics", position: 1, icon: "📈", color: "#10b981", key: "analytics" },
  ],
  databases: [
    {
      name: "Journal",
      title: "Trading Journal",
      type: "trading-journal",
      icon: "📓",
      sectionKey: "trading",
      properties: [
        { name: "Pair", type: PropertyType.SELECT, position: 0, config: { options: [] } },
        { name: "Notes", type: PropertyType.RELATION, position: 1, config: { sourceDatabaseType: "notes" } },
      ],
      seeds: [
        {
          name: "Sample Trade",
          icon: null,
          values: { Pair: "EURUSD" },
          relations: {},
        },
      ],
      templates: [{ name: "Default Template", icon: null, properties: [] }],
    },
    {
      name: "Notes",
      title: "Notes",
      type: "notes",
      icon: "📝",
      sectionKey: "analytics",
      properties: [{ name: "Content", type: PropertyType.TEXT, position: 0, config: {} }],
      seeds: [],
      templates: [],
    },
  ],
  defaultDatabaseProperties: [],
};

function setupFullMocks() {
  const mocks = {
    spaceService: {
      create: jest.fn().mockResolvedValue({ id: "space-1", name: "testuser's Space", isDefault: true, sections: [], databases: [] }),
      findOne: jest.fn().mockResolvedValue({ id: "space-1", name: "testuser's Space", isDefault: true, sections: [], databases: [] }),
    },
    sectionService: {
      create: jest
        .fn()
        .mockResolvedValueOnce({ id: "sec-1", name: "Trading", position: 0 })
        .mockResolvedValueOnce({ id: "sec-2", name: "Analytics", position: 1 }),
    },
    databaseService: {
      create: jest
        .fn()
        .mockResolvedValueOnce({ id: "db-1", name: "Journal", type: "trading-journal" })
        .mockResolvedValueOnce({ id: "db-2", name: "Notes", type: "notes" }),
    },
    propertyService: {
      create: jest.fn().mockResolvedValue({ id: "prop-1" }),
    },
    templateService: {
      create: jest.fn().mockResolvedValue({ id: "tpl-1" }),
    },
    propertyRepo: {
      findManyByDatabase: jest
        .fn()
        .mockResolvedValue([{ id: "prop-1", name: "Pair", type: "select", databaseId: "db-1", position: 0, config: {} }]),
    },
    propertyValueRepo: {
      createMany: jest.fn().mockResolvedValue([]),
      updateByCompositeKey: jest.fn().mockResolvedValue({}),
    },
    recordRepo: {
      create: jest.fn().mockResolvedValue({ id: "rec-1", name: "Sample Trade" }),
    },
    spaceRepo: {
      delete: jest.fn().mockResolvedValue({ id: "space-1" }),
    },
  };
  return mocks;
}

describe("InitializeUserSpaceUseCase", () => {
  let useCase: InitializeUserSpaceUseCase;
  let mocks: ReturnType<typeof setupFullMocks>;

  const mockLogger: jest.Mocked<AppLogger> = {
    setContext: jest.fn(),
    debug: jest.fn(),
    log: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  } as unknown as jest.Mocked<AppLogger>;

  const mockInitConfig: jest.Mocked<InitializationConfigService> = {
    getConfig: jest.fn().mockReturnValue(mockConfig),
  } as unknown as jest.Mocked<InitializationConfigService>;

  beforeEach(async () => {
    mocks = setupFullMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InitializeUserSpaceUseCase,
        { provide: SpaceService, useValue: mocks.spaceService },
        { provide: SectionService, useValue: mocks.sectionService },
        { provide: DatabaseService, useValue: mocks.databaseService },
        { provide: PropertyService, useValue: mocks.propertyService },
        { provide: TemplateService, useValue: mocks.templateService },
        { provide: InitializationConfigService, useValue: mockInitConfig },
        { provide: AppLogger, useValue: mockLogger },
        { provide: PropertyRepository, useValue: mocks.propertyRepo },
        { provide: PropertyValueRepository, useValue: mocks.propertyValueRepo },
        { provide: RecordRepository, useValue: mocks.recordRepo },
        { provide: SpaceRepository, useValue: mocks.spaceRepo },
      ],
    }).compile();

    useCase = module.get<InitializeUserSpaceUseCase>(InitializeUserSpaceUseCase);
  });

  describe("initialize", () => {
    it("TC-WS-U-006: should create default space with user's name", async () => {
      await useCase.initialize("user-1", "testuser");

      expect(mocks.spaceService.create).toHaveBeenCalledWith("user-1", {
        name: "testuser's Space",
        isDefault: true,
        icon: "🏠",
      });
    });

    it("TC-WS-U-006: should seed sections from config", async () => {
      await useCase.initialize("user-1", "testuser");

      expect(mocks.sectionService.create).toHaveBeenCalledTimes(2);
      expect(mocks.sectionService.create).toHaveBeenCalledWith("space-1", expect.objectContaining({ name: "Trading" }));
      expect(mocks.sectionService.create).toHaveBeenCalledWith("space-1", expect.objectContaining({ name: "Analytics" }));
    });

    it("TC-WS-U-006: should seed databases from config", async () => {
      await useCase.initialize("user-1", "testuser");

      expect(mocks.databaseService.create).toHaveBeenCalledTimes(2);
    });

    it("TC-WS-U-006: should seed properties with resolved relation references", async () => {
      await useCase.initialize("user-1", "testuser");

      expect(mocks.propertyService.create).toHaveBeenCalledTimes(3);
      expect(mocks.propertyService.create).toHaveBeenCalledWith(
        "db-1",
        expect.objectContaining({
          name: "Notes",
          type: PropertyType.RELATION,
          config: expect.objectContaining({ relatedEntityId: "db-2" }),
        }),
        "user-1",
      );
    });

    it("TC-WS-U-006: should seed records with property values", async () => {
      await useCase.initialize("user-1", "testuser");

      expect(mocks.recordRepo.create).toHaveBeenCalledWith({
        databaseId: "db-1",
        name: "Sample Trade",
        icon: null,
      });
      expect(mocks.propertyValueRepo.createMany).toHaveBeenCalled();
    });

    it("TC-WS-U-006: should seed templates from config", async () => {
      await useCase.initialize("user-1", "testuser");

      expect(mocks.templateService.create).toHaveBeenCalledWith("db-1", expect.objectContaining({ name: "Default Template" }), "user-1");
    });

    it("TC-WS-U-006: should rollback space on seed failure", async () => {
      const failingSectionService = {
        create: jest.fn().mockRejectedValue(new Error("Seed error")),
        processOperations: jest.fn(),
      };

      const module: TestingModule = await Test.createTestingModule({
        providers: [
          InitializeUserSpaceUseCase,
          { provide: SpaceService, useValue: mocks.spaceService },
          { provide: SectionService, useValue: failingSectionService },
          { provide: DatabaseService, useValue: mocks.databaseService },
          { provide: PropertyService, useValue: mocks.propertyService },
          { provide: TemplateService, useValue: mocks.templateService },
          { provide: InitializationConfigService, useValue: mockInitConfig },
          { provide: AppLogger, useValue: mockLogger },
          { provide: PropertyRepository, useValue: mocks.propertyRepo },
          { provide: PropertyValueRepository, useValue: mocks.propertyValueRepo },
          { provide: RecordRepository, useValue: mocks.recordRepo },
          { provide: SpaceRepository, useValue: mocks.spaceRepo },
        ],
      }).compile();

      const failingUseCase = module.get<InitializeUserSpaceUseCase>(InitializeUserSpaceUseCase);

      await expect(failingUseCase.initialize("user-1", "testuser")).rejects.toThrow("Seed error");
      expect(mocks.spaceRepo.delete).toHaveBeenCalledWith("space-1");
    });
  });
});
