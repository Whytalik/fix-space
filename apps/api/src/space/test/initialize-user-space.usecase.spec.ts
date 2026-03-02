import { beforeEach, describe, expect, it, jest } from "@jest/globals";
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
    setContext: jest.fn(),
    debug: jest.fn(),
    log: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  };

  const mockSpaceService = {
    create: jest.fn(),
  };

  const mockSectionService = {
    create: jest.fn(),
  };

  const mockDatabaseService = {
    create: jest.fn(),
  };

  const mockPropertyService = {
    create: jest.fn(),
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
    getConfig: jest.fn().mockReturnValue(mockConfig),
    interpolateSpaceName: jest.fn().mockReturnValue("testuser's Space"),
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
    mockSectionService.create.mockResolvedValue({ id: "section-a-id" });
    mockDatabaseService.create.mockResolvedValue({ id: "db-1-id" });

    await useCase.initialize("user-123", "testuser");

    expect(mockConfigService.interpolateSpaceName).toHaveBeenCalledWith("testuser");
    expect(mockSpaceService.create).toHaveBeenCalledWith("user-123", {
      name: "testuser's Space",
    });
  });

  it("should create sections sorted by position", async () => {
    mockSpaceService.create.mockResolvedValue(mockSpaceResponse);
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
    mockSectionService.create.mockResolvedValue({ id: "section-a-id" });
    mockDatabaseService.create.mockResolvedValue({ id: "db-1-id" });

    await useCase.initialize("user-123", "testuser");

    expect(mockDatabaseService.create).toHaveBeenCalledWith(
      "space-123",
      {
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
    mockSectionService.create.mockResolvedValue({ id: "section-id" });
    mockDatabaseService.create.mockResolvedValue({ id: "db-id" });

    const result = await useCase.initialize("user-123", "testuser");

    expect(result).toEqual(mockSpaceResponse);
  });

  it("should log initialization summary", async () => {
    mockSpaceService.create.mockResolvedValue(mockSpaceResponse);
    mockSectionService.create.mockResolvedValue({ id: "section-id" });
    mockDatabaseService.create.mockResolvedValue({ id: "db-id" });

    await useCase.initialize("user-123", "testuser");

    expect(mockLogger.log).toHaveBeenCalledWith("User space initialized", {
      userId: "user-123",
      spaceId: "space-123",
      sections: 2,
      databases: 1,
    });
  });
});
