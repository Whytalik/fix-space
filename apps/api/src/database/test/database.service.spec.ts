import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { ConflictException, NotFoundException } from "@nestjs/common";
import type { TestingModule } from "@nestjs/testing";
import { Test } from "@nestjs/testing";
import { PropertyType } from "@nucleus/domain";
import { AppLogger } from "../../common/logger/app-logger.service";
import { defaultInitializationConfig } from "../../config/initialization.config";
import { PropertyTypeRegistry } from "../../property/types";
import { DatabaseRepository } from "../database.repository";
import { DatabaseService } from "../database.service";

describe("DatabaseService", () => {
  let service: DatabaseService;

  const mockLogger = {
    setContext: jest.fn<any>(),
    debug: jest.fn<any>(),
    log: jest.fn<any>(),
    warn: jest.fn<any>(),
    error: jest.fn<any>(),
  };

  const mockHandler = {
    type: PropertyType.TEXT,
    getDefaultConfig: jest.fn<any>().mockReturnValue({ defaultValue: "", isRichText: false }),
    validateConfig: jest.fn<any>().mockReturnValue(null),
  };

  const mockTypeRegistry = {
    getConfigHandler: jest.fn<any>().mockReturnValue(mockHandler),
  };

  const mockDatabaseRepo = {
    findSpaceByOwner: jest.fn<any>(),
    findByNameInSpace: jest.fn<any>(),
    findByIdWithOwner: jest.fn<any>(),
    findAllBySpace: jest.fn<any>(),
    findSectionInSpace: jest.fn<any>(),
    create: jest.fn<any>(),
    update: jest.fn<any>(),
    delete: jest.fn<any>(),
    transaction: jest.fn<any>(),
  };

  const mockSpace = { id: "space-123", ownerId: "user-123", name: "Test Space" };

  const mockDatabase = {
    id: "db-123",
    spaceId: "space-123",
    name: "Test DB",
    title: "Test Database",
    icon: null,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
    sectionId: null,
    config: { version: 1, type: "custom" },
  };

  let fakeTx: { property: { create: ReturnType<typeof jest.fn> } };

  beforeEach(async () => {
    jest.clearAllMocks();

    fakeTx = { property: { create: jest.fn<any>().mockResolvedValue({}) } };
    mockDatabaseRepo.transaction.mockImplementation(
      async (cb: (tx: typeof fakeTx) => Promise<unknown>) => cb(fakeTx),
    );

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DatabaseService,
        { provide: AppLogger, useValue: mockLogger },
        { provide: PropertyTypeRegistry, useValue: mockTypeRegistry },
        { provide: DatabaseRepository, useValue: mockDatabaseRepo },
      ],
    }).compile();

    service = module.get<DatabaseService>(DatabaseService);
  });

  describe("create", () => {
    it("should create a database with default properties and return DatabaseResponseDto", async () => {
      mockDatabaseRepo.findSpaceByOwner.mockResolvedValue(mockSpace);
      mockDatabaseRepo.findByNameInSpace.mockResolvedValue(null);
      mockDatabaseRepo.create.mockResolvedValue(mockDatabase);

      const result = await service.create(
        "space-123",
        { spaceId: "space-123", name: "Test DB", title: "Test Database" },
        "user-123",
      );

      expect(result.id).toBe("db-123");
      expect(result.name).toBe("Test DB");
      expect(mockDatabaseRepo.findSpaceByOwner).toHaveBeenCalledWith("space-123", "user-123");
      expect(mockDatabaseRepo.findByNameInSpace).toHaveBeenCalledWith("Test DB", "space-123");
      expect(mockDatabaseRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({ name: "Test DB", title: "Test Database", spaceId: "space-123" }),
        expect.anything(),
      );
      expect(fakeTx.property.create).toHaveBeenCalledTimes(
        defaultInitializationConfig.defaultDatabaseProperties.length,
      );
      expect(fakeTx.property.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          name: "Name",
          type: "TEXT",
          position: 0,
          isRequired: true,
          databaseId: "db-123",
        }),
      });
      expect(mockLogger.log).toHaveBeenCalledWith("Database created with properties", {
        databaseId: "db-123",
        spaceId: "space-123",
        propertyCount: defaultInitializationConfig.defaultDatabaseProperties.length,
      });
    });

    it("should throw NotFoundException when space not found", async () => {
      mockDatabaseRepo.findSpaceByOwner.mockResolvedValue(null);

      await expect(
        service.create("space-nonexistent", { spaceId: "space-nonexistent", name: "Test DB", title: "Test DB" }, "user-123"),
      ).rejects.toThrow(NotFoundException);
      await expect(
        service.create("space-nonexistent", { spaceId: "space-nonexistent", name: "Test DB", title: "Test DB" }, "user-123"),
      ).rejects.toThrow("Space not found");
    });

    it("should throw ConflictException when database name already taken in space", async () => {
      mockDatabaseRepo.findSpaceByOwner.mockResolvedValue(mockSpace);
      mockDatabaseRepo.findByNameInSpace.mockResolvedValue(mockDatabase);

      await expect(
        service.create("space-123", { spaceId: "space-123", name: "Test DB", title: "Test DB" }, "user-123"),
      ).rejects.toThrow(ConflictException);
      await expect(
        service.create("space-123", { spaceId: "space-123", name: "Test DB", title: "Test DB" }, "user-123"),
      ).rejects.toThrow("Database name is already taken in this space.");
    });
  });

  describe("findAll", () => {
    it("should return array of DatabaseResponseDto for the space", async () => {
      const databases = [mockDatabase, { ...mockDatabase, id: "db-456", name: "DB 2" }];
      mockDatabaseRepo.findAllBySpace.mockResolvedValue(databases);

      const result = await service.findAll("space-123", "user-123");

      expect(result).toHaveLength(2);
      expect(result[0]!.id).toBe("db-123");
      expect(result[1]!.id).toBe("db-456");
      expect(mockDatabaseRepo.findAllBySpace).toHaveBeenCalledWith("space-123", "user-123");
    });

    it("should return empty array when no databases", async () => {
      mockDatabaseRepo.findAllBySpace.mockResolvedValue([]);

      const result = await service.findAll("space-123", "user-123");

      expect(result).toEqual([]);
    });
  });

  describe("findOne", () => {
    it("should return DatabaseResponseDto for valid id", async () => {
      mockDatabaseRepo.findByIdWithOwner.mockResolvedValue(mockDatabase);

      const result = await service.findOne("db-123", "user-123");

      expect(result.id).toBe("db-123");
      expect(result.name).toBe("Test DB");
      expect(mockDatabaseRepo.findByIdWithOwner).toHaveBeenCalledWith("db-123", "user-123");
    });

    it("should throw NotFoundException when database not found", async () => {
      mockDatabaseRepo.findByIdWithOwner.mockResolvedValue(null);

      await expect(service.findOne("nonexistent", "user-123")).rejects.toThrow(NotFoundException);
      await expect(service.findOne("nonexistent", "user-123")).rejects.toThrow(
        "Database with id nonexistent not found",
      );
    });
  });

  describe("update", () => {
    it("should update database fields and return DatabaseResponseDto", async () => {
      const updatedDatabase = { ...mockDatabase, name: "Updated DB", title: "New Title" };
      mockDatabaseRepo.findByIdWithOwner.mockResolvedValue(mockDatabase);
      mockDatabaseRepo.update.mockResolvedValue(updatedDatabase);

      const result = await service.update("db-123", { name: "Updated DB", title: "New Title" }, "user-123");

      expect(result.name).toBe("Updated DB");
      expect(result.title).toBe("New Title");
      expect(mockDatabaseRepo.update).toHaveBeenCalledWith(
        "db-123",
        expect.objectContaining({ name: "Updated DB", title: "New Title" }),
      );
      expect(mockLogger.log).toHaveBeenCalledWith("Database updated", { id: "db-123" });
    });

    it("should throw NotFoundException when database not found", async () => {
      mockDatabaseRepo.findByIdWithOwner.mockResolvedValue(null);

      await expect(service.update("nonexistent", { name: "Updated" }, "user-123")).rejects.toThrow(NotFoundException);
      await expect(service.update("nonexistent", { name: "Updated" }, "user-123")).rejects.toThrow(
        "Database with id nonexistent not found",
      );
    });

    it("should validate section belongs to space when sectionId is provided", async () => {
      mockDatabaseRepo.findByIdWithOwner.mockResolvedValue(mockDatabase);
      mockDatabaseRepo.findSectionInSpace.mockResolvedValue(null);

      await expect(
        service.update("db-123", { sectionId: "section-nonexistent" }, "user-123"),
      ).rejects.toThrow(NotFoundException);
      await expect(
        service.update("db-123", { sectionId: "section-nonexistent" }, "user-123"),
      ).rejects.toThrow("Section not found in this space");
    });
  });

  describe("remove", () => {
    it("should delete database and return DatabaseResponseDto", async () => {
      mockDatabaseRepo.findByIdWithOwner.mockResolvedValue(mockDatabase);
      mockDatabaseRepo.delete.mockResolvedValue(mockDatabase);

      const result = await service.remove("db-123", "user-123");

      expect(result.id).toBe("db-123");
      expect(mockDatabaseRepo.findByIdWithOwner).toHaveBeenCalledWith("db-123", "user-123");
      expect(mockDatabaseRepo.delete).toHaveBeenCalledWith("db-123");
      expect(mockLogger.log).toHaveBeenCalledWith("Database removed", { id: "db-123" });
    });

    it("should throw NotFoundException when database not found", async () => {
      mockDatabaseRepo.findByIdWithOwner.mockResolvedValue(null);

      await expect(service.remove("nonexistent", "user-123")).rejects.toThrow(NotFoundException);
      await expect(service.remove("nonexistent", "user-123")).rejects.toThrow("Database with id nonexistent not found");
    });
  });
});
