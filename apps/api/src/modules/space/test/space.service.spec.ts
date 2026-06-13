import { BadRequestException, NotFoundException } from "@nestjs/common";
import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import type { TestingModule } from "@nestjs/testing";
import { Test } from "@nestjs/testing";
import { AppLogger } from "@/common/logger/app-logger.service";
import { DatabaseService } from "@/modules/database/database.service";
import { SettingsService } from "@/modules/settings/settings.service";
import { SectionService } from "../providers/section.service";
import { SpaceRepository } from "../repositories/space.repository";
import { SpaceService } from "../space.service";

jest.mock("@fixspace/database", () => ({
  prisma: {
    space: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
      delete: jest.fn(),
    },
    $transaction: jest.fn((callback: (tx: unknown) => unknown) => callback(prisma)),
  },
}));

import { prisma } from "@fixspace/database";

describe("SpaceService", () => {
  let service: SpaceService;
  let spaceRepo: jest.Mocked<SpaceRepository>;

  const mockLogger: jest.Mocked<AppLogger> = {
    setContext: jest.fn(),
    debug: jest.fn(),
    log: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  } as unknown as jest.Mocked<AppLogger>;

  const mockSpaceRepo = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    findOwner: jest.fn(),
    count: jest.fn(),
    update: jest.fn(),
    updateMany: jest.fn(),
    delete: jest.fn(),
    transaction: jest.fn((callback) => callback(prisma)),
  };

  const mockSectionService = {
    create: jest.fn(),
    processOperations: jest.fn(),
  };

  const mockDatabaseService = {
    processDatabaseOperations: jest.fn(),
  };

  const mockSettingsService = {
    getSettings: jest.fn(),
    resolveDefaults: jest.fn().mockImplementation((userId, category, dto) => Promise.resolve(dto)),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SpaceService,
        { provide: DatabaseService, useValue: mockDatabaseService },
        { provide: SettingsService, useValue: mockSettingsService },
        { provide: SpaceRepository, useValue: mockSpaceRepo },
        { provide: SectionService, useValue: mockSectionService },
        { provide: AppLogger, useValue: mockLogger },
      ],
    }).compile();

    service = module.get<SpaceService>(SpaceService);
    spaceRepo = module.get(SpaceRepository);

    jest.clearAllMocks();
    mockSpaceRepo.count.mockResolvedValue(0);
  });

  describe("create", () => {
    it("TC-WS-U-001: should create space with default settings (isDefault=false)", async () => {
      const createdSpace = {
        id: "space-1",
        name: "Test Space",
        icon: null,
        isDefault: false,
        ownerId: "user-1",
        config: null,
        sections: [],
        databases: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockSpaceRepo.create.mockResolvedValue(createdSpace);

      const result = await service.create("user-1", { name: "Test Space" });

      expect(result).toBeDefined();
      expect(spaceRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          name: "Test Space",
          ownerId: "user-1",
          isDefault: false,
        }),
        expect.any(Object),
        expect.anything(),
      );
    });

    it("TC-WS-U-001: should create space with explicit isDefault=true", async () => {
      const createdSpace = {
        id: "space-2",
        name: "Default Space",
        icon: "🏠",
        isDefault: true,
        ownerId: "user-1",
        config: null,
        sections: [],
        databases: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockSpaceRepo.create.mockResolvedValue(createdSpace);

      const result = await service.create("user-1", { name: "Default Space", icon: "🏠", isDefault: true });

      expect(result).toBeDefined();
      expect(spaceRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          name: "Default Space",
          icon: "🏠",
          ownerId: "user-1",
          isDefault: true,
        }),
        expect.any(Object),
        expect.anything(),
      );
    });

    it("TC-WS-U-005: should throw BadRequestException if space limit of 5 is reached", async () => {
      mockSpaceRepo.count.mockResolvedValue(5);

      await expect(service.create("user-1", { name: "New Space" })).rejects.toThrow(BadRequestException);
      expect(spaceRepo.create).not.toHaveBeenCalled();
    });
  });

  describe("findOne", () => {
    it("TC-WS-U-002: should return space when found", async () => {
      const foundSpace = {
        id: "space-1",
        name: "Test Space",
        icon: null,
        isDefault: false,
        ownerId: "user-1",
        config: null,
        sections: [],
        databases: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockSpaceRepo.findOne.mockResolvedValue(foundSpace);

      const result = await service.findOne("space-1");

      expect(result).toBeDefined();
      expect(spaceRepo.findOne).toHaveBeenCalledWith("space-1", expect.any(Object));
    });

    it("TC-WS-U-002: should throw NotFoundException when space not found", async () => {
      mockSpaceRepo.findOne.mockResolvedValue(null);

      await expect(service.findOne("nonexistent")).rejects.toThrow(NotFoundException);
    });
  });

  describe("update", () => {
    it("TC-WS-U-003: should reset isDefault of other spaces when setting isDefault=true", async () => {
      const currentSpace = { id: "space-1", ownerId: "user-1", isDefault: false };
      const updatedSpace = {
        id: "space-1",
        name: "Updated Space",
        icon: null,
        isDefault: true,
        ownerId: "user-1",
        config: null,
        sections: [],
        databases: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockSpaceRepo.findOwner.mockResolvedValue(currentSpace);
      mockSpaceRepo.updateMany.mockResolvedValue({ count: 2 });
      mockSpaceRepo.update.mockResolvedValue(updatedSpace);

      const result = await service.update("space-1", { isDefault: true });

      expect(result).toBeDefined();
      expect(spaceRepo.findOwner).toHaveBeenCalledWith("space-1", prisma);
      expect(spaceRepo.updateMany).toHaveBeenCalledWith(
        { ownerId: "user-1", isDefault: true, id: { not: "space-1" } },
        { isDefault: false },
        prisma,
      );
    });

    it("TC-WS-U-003: should not reset other spaces when isDefault is not set to true", async () => {
      const updatedSpace = {
        id: "space-1",
        name: "Updated Name",
        icon: null,
        isDefault: false,
        ownerId: "user-1",
        config: null,
        sections: [],
        databases: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockSpaceRepo.update.mockResolvedValue(updatedSpace);

      const result = await service.update("space-1", { name: "Updated Name" });

      expect(result).toBeDefined();
      expect(spaceRepo.findOwner).not.toHaveBeenCalled();
      expect(spaceRepo.updateMany).not.toHaveBeenCalled();
    });
  });

  describe("remove", () => {
    it("TC-WS-U-004: should throw BadRequestException when trying to delete default space", async () => {
      mockSpaceRepo.findOwner.mockResolvedValue({ ownerId: "user-1", isDefault: true });

      await expect(service.remove("space-1")).rejects.toThrow(BadRequestException);
      expect(spaceRepo.delete).not.toHaveBeenCalled();
    });

    it("TC-WS-U-004: should allow deleting non-default space", async () => {
      const deletedSpace = {
        id: "space-2",
        name: "To Delete",
        icon: null,
        isDefault: false,
        ownerId: "user-1",
        config: null,
        sections: [],
        databases: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockSpaceRepo.findOwner.mockResolvedValue({ ownerId: "user-1", isDefault: false });
      mockSpaceRepo.delete.mockResolvedValue(deletedSpace);

      const result = await service.remove("space-2");

      expect(result).toBeDefined();
      expect(spaceRepo.findOwner).toHaveBeenCalledWith("space-2");
      expect(spaceRepo.delete).toHaveBeenCalledWith("space-2");
    });
  });
});
