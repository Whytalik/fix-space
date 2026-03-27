import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { BadRequestException, NotFoundException } from "@nestjs/common";
import type { TestingModule } from "@nestjs/testing";
import { Test } from "@nestjs/testing";
import { AppLogger } from "../../common/logger/app-logger.service";
import { SettingsService } from "../../settings/settings.service";
import { SectionService } from "../providers/section.service";
import { SpaceRepository } from "../space.repository";
import { SpaceService } from "../space.service";

const sectionsInclude = {
  sections: {
    orderBy: { position: "asc" },
    include: {
      databases: {
        orderBy: { createdAt: "asc" },
      },
    },
  },
  databases: {
    orderBy: { createdAt: "asc" },
  },
};

describe("SpaceService", () => {
  let service: SpaceService;

  const mockLogger = {
    setContext: jest.fn<any>(),
    debug: jest.fn<any>(),
    log: jest.fn<any>(),
    warn: jest.fn<any>(),
    error: jest.fn<any>(),
  };

  const mockSectionService = {
    processOperations: jest.fn<any>(),
  };

  const mockSettingsService = {
    getSettings: jest.fn<any>(),
  };

  const mockSpaceRepo = {
    findAll: jest.fn<any>(),
    findOne: jest.fn<any>(),
    findOwner: jest.fn<any>(),
    create: jest.fn<any>(),
    update: jest.fn<any>(),
    updateMany: jest.fn<any>(),
    delete: jest.fn<any>(),
    transaction: jest.fn<any>(),
  };

  const mockSpace = {
    id: "space-123",
    ownerId: "user-123",
    name: "Test Space",
    icon: "🚀",
    createdAt: new Date("2024-01-01"),
    config: null,
    sections: [],
  };

  const fakeTx = {};

  beforeEach(async () => {
    jest.clearAllMocks();
    mockSpaceRepo.transaction.mockImplementation(async (cb: (tx: unknown) => Promise<unknown>) => cb(fakeTx));

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SpaceService,
        { provide: AppLogger, useValue: mockLogger },
        { provide: SectionService, useValue: mockSectionService },
        { provide: SettingsService, useValue: mockSettingsService },
        { provide: SpaceRepository, useValue: mockSpaceRepo },
      ],
    }).compile();

    service = module.get<SpaceService>(SpaceService);
  });

  describe("create", () => {
    it("should create a space and return SpaceResponseDto", async () => {
      mockSpaceRepo.create.mockResolvedValue(mockSpace);

      const result = await service.create("user-123", {
        name: "Test Space",
        icon: "🚀",
      });

      expect(result.id).toBe("space-123");
      expect(result.name).toBe("Test Space");
      expect(mockSpaceRepo.create).toHaveBeenCalledWith(
        {
          name: "Test Space",
          icon: "🚀",
          isDefault: false,
          ownerId: "user-123",
        },
        sectionsInclude,
        fakeTx,
      );
      expect(mockLogger.log).toHaveBeenCalledWith("Space created", {
        spaceId: "space-123",
        ownerId: "user-123",
      });
    });

    it("should rethrow unknown errors", async () => {
      mockSpaceRepo.create.mockRejectedValue(new Error("DB error"));

      await expect(service.create("user-123", { name: "Test" })).rejects.toThrow("DB error");
    });

    it("should unset other default spaces before creating when isDefault is true", async () => {
      mockSpaceRepo.updateMany.mockResolvedValue({ count: 1 });
      mockSpaceRepo.create.mockResolvedValue({ ...mockSpace, isDefault: true });

      await service.create("user-123", { name: "Default Space", isDefault: true });

      expect(mockSpaceRepo.updateMany).toHaveBeenCalledWith(
        { ownerId: "user-123", isDefault: true },
        { isDefault: false },
        fakeTx,
      );
      expect(mockSpaceRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({ isDefault: true }),
        sectionsInclude,
        fakeTx,
      );
    });
  });

  describe("findAll", () => {
    it("should return array of SpaceResponseDto for owner", async () => {
      const spaces = [mockSpace, { ...mockSpace, id: "space-456", name: "Space 2" }];
      mockSpaceRepo.findAll.mockResolvedValue(spaces);

      const result = await service.findAll("user-123");

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe("space-123");
      expect(result[1].id).toBe("space-456");
      expect(mockSpaceRepo.findAll).toHaveBeenCalledWith("user-123", sectionsInclude);
    });

    it("should return empty array when no spaces", async () => {
      mockSpaceRepo.findAll.mockResolvedValue([]);

      const result = await service.findAll("user-123");

      expect(result).toEqual([]);
    });
  });

  describe("findOne", () => {
    it("should return SpaceResponseDto for valid id", async () => {
      mockSpaceRepo.findOne.mockResolvedValue(mockSpace);

      const result = await service.findOne("space-123");

      expect(result.id).toBe("space-123");
      expect(result.name).toBe("Test Space");
      expect(mockSpaceRepo.findOne).toHaveBeenCalledWith("space-123", sectionsInclude);
    });

    it("should throw NotFoundException when space not found", async () => {
      mockSpaceRepo.findOne.mockResolvedValue(null);

      await expect(service.findOne("nonexistent")).rejects.toThrow(NotFoundException);
      await expect(service.findOne("nonexistent")).rejects.toThrow("Space with id nonexistent not found");
    });
  });

  describe("update", () => {
    it("should update space name and return SpaceResponseDto", async () => {
      const updatedSpace = { ...mockSpace, name: "Updated Name" };
      mockSpaceRepo.update.mockResolvedValue(updatedSpace);

      const result = await service.update("space-123", { name: "Updated Name" });

      expect(result.name).toBe("Updated Name");
      expect(mockSpaceRepo.update).toHaveBeenCalledWith(
        "space-123",
        expect.objectContaining({ name: "Updated Name" }),
        sectionsInclude,
        fakeTx,
      );
    });

    it("should process section operations before updating space", async () => {
      mockSpaceRepo.update.mockResolvedValue(mockSpace);

      const sectionOps = [
        {
          operation: "CREATE" as const,
          create: { name: "New Section" },
        },
      ];

      await service.update("space-123", {
        name: "Test",
        sectionOperations: sectionOps as any,
      });

      expect(mockSectionService.processOperations).toHaveBeenCalledWith(fakeTx, "space-123", sectionOps);
    });

    it("should not process section operations when empty", async () => {
      mockSpaceRepo.update.mockResolvedValue(mockSpace);

      await service.update("space-123", { name: "Test" });

      expect(mockSectionService.processOperations).not.toHaveBeenCalled();
    });

    it("should unset other default spaces before updating when isDefault is true", async () => {
      const updatedSpace = { ...mockSpace, isDefault: true };
      mockSpaceRepo.findOwner.mockResolvedValue({ ownerId: "user-123", isDefault: false });
      mockSpaceRepo.updateMany.mockResolvedValue({ count: 1 });
      mockSpaceRepo.update.mockResolvedValue(updatedSpace);

      await service.update("space-123", { isDefault: true });

      expect(mockSpaceRepo.findOwner).toHaveBeenCalledWith("space-123", fakeTx);
      expect(mockSpaceRepo.updateMany).toHaveBeenCalledWith(
        { ownerId: "user-123", isDefault: true, id: { not: "space-123" } },
        { isDefault: false },
        fakeTx,
      );
    });
  });

  describe("remove", () => {
    it("should delete space and return SpaceResponseDto", async () => {
      mockSpaceRepo.delete.mockResolvedValue(mockSpace);

      const result = await service.remove("space-123");

      expect(result.id).toBe("space-123");
      expect(mockSpaceRepo.delete).toHaveBeenCalledWith("space-123");
      expect(mockLogger.log).toHaveBeenCalledWith("Space removed", { id: "space-123" });
    });

    it("should rethrow unknown errors", async () => {
      mockSpaceRepo.delete.mockRejectedValue(new Error("DB error"));

      await expect(service.remove("space-123")).rejects.toThrow("DB error");
    });

    it("should throw BadRequestException when trying to remove the default space", async () => {
      mockSpaceRepo.findOwner.mockResolvedValue({ isDefault: true, ownerId: "user-123" });

      await expect(service.remove("space-123")).rejects.toThrow(BadRequestException);
      await expect(service.remove("space-123")).rejects.toThrow("Cannot delete the default space");
    });
  });
});
