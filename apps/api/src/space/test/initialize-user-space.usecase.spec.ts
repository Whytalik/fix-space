import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { PropertyType } from "@nucleus/domain";
import { Test, TestingModule } from "@nestjs/testing";
import { AppLogger } from "../../common/logger/app-logger.service";
import { InitializationConfigService } from "../../config/initialization-config.service";
import { DatabaseService } from "../../database/database.service";
import { PropertyService } from "../../property/property.service";
import { SectionService } from "../providers/section.service";
import { InitializeUserSpaceUseCase } from "../providers/initialize-user-space.usecase";
import { SpaceService } from "../space.service";

describe("InitializeUserSpaceUseCase", () => {
  let useCase: InitializeUserSpaceUseCase;

  const mockLogger = {
    setContext: jest.fn<any>(),
    debug: jest.fn<any>(),
    log: jest.fn<any>(),
    warn: jest.fn<any>(),
    error: jest.fn<any>(),
  };

  const mockSpaceService = {
    create: jest.fn<any>(),
    findOne: jest.fn<any>(),
  };

  const mockSectionService = {
    create: jest.fn<any>(),
  };

  const mockDatabaseService = {
    create: jest.fn<any>(),
  };

  const mockPropertyService = {
    create: jest.fn<any>(),
  };

  const mockConfig = {
    space: {
      name: "{{username}}'s Space",
    },
    sections: [
      {
        key: "b",
        name: "Section B",
        position: 2,
      },
      {
        key: "a",
        name: "Section A",
        position: 1,
      },
    ],
    databases: [
      {
        name: "db-1",
        title: "Tasks",
        type: "custom",
        sectionKey: "a",
        properties: [],
      },
    ],
  };

  const mockConfigService = {
    getConfig: jest.fn<any>().mockReturnValue(mockConfig),
    interpolateSpaceName: jest.fn<any>().mockReturnValue("testuser's Space"),
  };

  const mockSpaceResponse = {
    id: "space-123",
    ownerId: "user-123",
    name: "testuser's Space",
    sections: [],
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InitializeUserSpaceUseCase,
        {
          provide: SpaceService,
          useValue: mockSpaceService,
        },
        {
          provide: SectionService,
          useValue: mockSectionService,
        },
        {
          provide: DatabaseService,
          useValue: mockDatabaseService,
        },
        {
          provide: PropertyService,
          useValue: mockPropertyService,
        },
        {
          provide: InitializationConfigService,
          useValue: mockConfigService,
        },
        {
          provide: AppLogger,
          useValue: mockLogger,
        },
      ],
    }).compile();

    useCase = module.get<InitializeUserSpaceUseCase>(InitializeUserSpaceUseCase);
  });

  it("should create space with interpolated name", async () => {
    mockSpaceService.create.mockResolvedValue(mockSpaceResponse);
    mockSpaceService.findOne.mockResolvedValue(mockSpaceResponse);
    mockSectionService.create.mockResolvedValue({ id: "section-a-id" });
    mockDatabaseService.create.mockResolvedValue({ id: "db-1-id" });

    await useCase.initialize("user-123", "testuser");

    expect(mockConfigService.interpolateSpaceName).toHaveBeenCalledWith("testuser");
    expect(mockSpaceService.create).toHaveBeenCalledWith("user-123", {
      name: "testuser's Space",
      isDefault: true,
    });
  });

  it("should create sections sorted by position", async () => {
    mockSpaceService.create.mockResolvedValue(mockSpaceResponse);
    mockSpaceService.findOne.mockResolvedValue(mockSpaceResponse);
    mockSectionService.create.mockResolvedValue({ id: "section-id" });
    mockDatabaseService.create.mockResolvedValue({ id: "db-id" });

    await useCase.initialize("user-123", "testuser");

    expect(mockSectionService.create).toHaveBeenCalledTimes(2);
    // Section A (position 1) should be created before Section B (position 2)
    expect(mockSectionService.create).toHaveBeenNthCalledWith(1, "space-123", {
      name: "Section A",
      position: 1,
    });
    expect(mockSectionService.create).toHaveBeenNthCalledWith(2, "space-123", {
      name: "Section B",
      position: 2,
    });
  });

  it("should create databases from config with sectionId and empty properties", async () => {
    mockSpaceService.create.mockResolvedValue(mockSpaceResponse);
    mockSpaceService.findOne.mockResolvedValue(mockSpaceResponse);
    mockSectionService.create.mockResolvedValue({ id: "section-a-id" });
    mockDatabaseService.create.mockResolvedValue({ id: "db-1-id" });

    await useCase.initialize("user-123", "testuser");

    expect(mockDatabaseService.create).toHaveBeenCalledWith(
      "space-123",
      {
        spaceId: "space-123",
        name: "db-1",
        title: "Tasks",
        type: "custom",
        sectionId: "section-a-id",
        properties: [],
      },
      "user-123",
    );
  });

  it("should return the created space", async () => {
    mockSpaceService.create.mockResolvedValue(mockSpaceResponse);
    mockSpaceService.findOne.mockResolvedValue(mockSpaceResponse);
    mockSectionService.create.mockResolvedValue({ id: "section-id" });
    mockDatabaseService.create.mockResolvedValue({ id: "db-id" });

    const result = await useCase.initialize("user-123", "testuser");

    expect(result).toEqual(mockSpaceResponse);
  });

  it("should resolve RELATION sourceDatabaseType to the created database id", async () => {
    const configWithRelation = {
      ...mockConfig,
      databases: [
        {
          name: "db-source",
          title: "Source DB",
          type: "source-type",
          sectionKey: "a",
          properties: [],
        },
        {
          name: "db-with-relation",
          title: "Relation DB",
          type: "relation-type",
          sectionKey: "a",
          properties: [
            {
              name: "Linked",
              type: PropertyType.RELATION,
              config: { sourceDatabaseType: "source-type", multiple: false },
            },
          ],
        },
      ],
    };
    mockConfigService.getConfig.mockReturnValueOnce(configWithRelation);
    mockSpaceService.create.mockResolvedValue(mockSpaceResponse);
    mockSpaceService.findOne.mockResolvedValue(mockSpaceResponse);
    mockSectionService.create.mockResolvedValue({ id: "section-a-id" });
    mockDatabaseService.create
      .mockResolvedValueOnce({ id: "source-db-id" })
      .mockResolvedValueOnce({ id: "relation-db-id" });
    mockPropertyService.create.mockResolvedValue({ id: "prop-id" });

    await useCase.initialize("user-123", "testuser");

    expect(mockPropertyService.create).toHaveBeenCalledWith(
      "relation-db-id",
      expect.objectContaining({
        config: expect.objectContaining({ relatedEntityId: "source-db-id" }),
      }),
      "user-123",
    );
  });

  it("should throw Error when database type is unknown in Pass 3", async () => {
    const configWithNoType = {
      ...mockConfig,
      databases: [{ name: "db-no-type", title: "No Type DB", sectionKey: "a", properties: [] }],
    };
    mockConfigService.getConfig.mockReturnValueOnce(configWithNoType);
    mockSpaceService.create.mockResolvedValue(mockSpaceResponse);
    mockSectionService.create.mockResolvedValue({ id: "section-id" });
    mockDatabaseService.create.mockResolvedValue({ id: "db-id" });

    await expect(useCase.initialize("user-123", "testuser")).rejects.toThrow("Space initialization failed");
  });

  it("should throw Error when RELATION sourceDatabaseType is unknown", async () => {
    const configWithBadRelation = {
      ...mockConfig,
      databases: [
        {
          name: "db-1",
          title: "Tasks",
          type: "custom",
          sectionKey: "a",
          properties: [
            {
              name: "BadRel",
              type: PropertyType.RELATION,
              config: { sourceDatabaseType: "unknown-type", multiple: false },
            },
          ],
        },
      ],
    };
    mockConfigService.getConfig.mockReturnValueOnce(configWithBadRelation);
    mockSpaceService.create.mockResolvedValue(mockSpaceResponse);
    mockSectionService.create.mockResolvedValue({ id: "section-id" });
    mockDatabaseService.create.mockResolvedValue({ id: "db-1-id" });

    await expect(useCase.initialize("user-123", "testuser")).rejects.toThrow(
      'RELATION property "BadRel" references unknown sourceDatabaseType "unknown-type"',
    );
  });

  it("should log initialization summary", async () => {
    mockSpaceService.create.mockResolvedValue(mockSpaceResponse);
    mockSpaceService.findOne.mockResolvedValue(mockSpaceResponse);
    mockSectionService.create.mockResolvedValue({ id: "section-id" });
    mockDatabaseService.create.mockResolvedValue({ id: "db-id" });

    await useCase.initialize("user-123", "testuser");

    expect(mockLogger.log).toHaveBeenCalledWith("Space content seeded", {
      spaceId: "space-123",
      sections: 2,
      databases: 1,
    });
    expect(mockLogger.log).toHaveBeenCalledWith("User space initialized", {
      userId: "user-123",
      spaceId: "space-123",
    });
  });
});
