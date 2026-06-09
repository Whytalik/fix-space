import { BadRequestException, ConflictException, NotFoundException } from "@nestjs/common";
import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import type { TestingModule } from "@nestjs/testing";
import { Test } from "@nestjs/testing";
import { AppLogger } from "@/common/logger/app-logger.service";
import { SettingsService } from "@/modules/settings/settings.service";
import { PropertyTypeRegistry } from "@/modules/property/types";
import { DatabaseService } from "../database.service";
import { DatabaseRepository } from "../repositories/database.repository";
import { SpaceRepository } from "@/modules/space/repositories/space.repository";
import { ViewRepository } from "@/modules/view/repositories/view.repository";

jest.mock("@fixspace/database", () => ({
  Prisma: {
    InputJsonValue: undefined,
  },
  prisma: {
    space: { findFirst: jest.fn() },
    database: {
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    section: { findFirst: jest.fn() },
    property: { create: jest.fn() },
    $transaction: jest.fn((callback: (tx: unknown) => unknown) => callback(prisma)),
  },
}));

import { prisma } from "@fixspace/database";

describe("DatabaseService", () => {
  let service: DatabaseService;
  let databaseRepo: jest.Mocked<DatabaseRepository>;

  const mockLogger: jest.Mocked<AppLogger> = {
    setContext: jest.fn(),
    debug: jest.fn(),
    log: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  } as unknown as jest.Mocked<AppLogger>;

  const mockTypeRegistry: jest.Mocked<PropertyTypeRegistry> = {
    getConfigHandler: jest.fn().mockReturnValue({
      getDefaultConfig: jest.fn().mockReturnValue({}),
      validateConfig: jest.fn().mockReturnValue(null),
    }),
  } as unknown as jest.Mocked<PropertyTypeRegistry>;

  const mockDatabaseRepo = {
    findSpaceByOwner: jest.fn(),
    findByNameInSpace: jest.fn(),
    findById: jest.fn(),
    findByIdForDuplicate: jest.fn(),
    findAllBySpace: jest.fn(),
    findSectionInSpace: jest.fn(),
    findLastPosition: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    transaction: jest.fn((callback) => callback(prisma)),
  };

  const mockSettingsService = {
    getDefaultIcon: jest.fn().mockResolvedValue("icon:Database"),
    resolveDefaults: jest.fn().mockImplementation((userId, category, dto) => Promise.resolve(dto)),
  };

  const mockSpaceRepo = {
    findOne: jest.fn(),
  };

  const mockViewRepo = {
    create: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DatabaseService,
        { provide: DatabaseRepository, useValue: mockDatabaseRepo },
        { provide: SpaceRepository, useValue: mockSpaceRepo },
        { provide: ViewRepository, useValue: mockViewRepo },
        { provide: PropertyTypeRegistry, useValue: mockTypeRegistry },
        { provide: SettingsService, useValue: mockSettingsService },
        { provide: AppLogger, useValue: mockLogger },
      ],
    }).compile();

    service = module.get<DatabaseService>(DatabaseService);
    databaseRepo = module.get(DatabaseRepository);

    jest.clearAllMocks();
  });

  describe("create", () => {
    it("TC-DB-U-001: should create database with default properties", async () => {
      mockSpaceRepo.findOne.mockResolvedValue({ id: "space-1", ownerId: "user-1" });
      mockDatabaseRepo.findByNameInSpace.mockResolvedValue(null);
      mockDatabaseRepo.findLastPosition.mockResolvedValue(null);
      mockDatabaseRepo.create.mockResolvedValue({
        id: "db-1",
        name: "custom-db",
        title: "Custom DB",
        spaceId: "space-1",
        sectionId: null,
      });
      (prisma.property.create as jest.Mock<any>).mockResolvedValue({ id: "prop-1" });

      const result = await service.create(
        "space-1",
        {
          spaceId: "space-1",
          name: "custom-db",
          title: "Custom DB",
          properties: [{ name: "Name", type: "TEXT", position: 0 } as any],
        },
        "user-1",
      );

      expect(result).toBeDefined();
      expect(databaseRepo.create).toHaveBeenCalled();
      expect(prisma.property.create).toHaveBeenCalled();
    });

    it("TC-DB-U-002: should throw NotFoundException when space does not exist", async () => {
      mockSpaceRepo.findOne.mockResolvedValue(null);

      await expect(
        service.create("nonexistent", { spaceId: "nonexistent", name: "custom-db", title: "Custom DB" }, "user-1"),
      ).rejects.toThrow(NotFoundException);
    });

    it("TC-DB-U-002: should throw ConflictException when database name is taken", async () => {
      mockSpaceRepo.findOne.mockResolvedValue({ id: "space-1", ownerId: "user-1" });
      mockDatabaseRepo.findByNameInSpace.mockResolvedValue({ id: "db-1", name: "existing-db" });

      await expect(service.create("space-1", { spaceId: "space-1", name: "existing-db", title: "Existing DB" }, "user-1")).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe("findOne", () => {
    it("TC-DB-U-003: should return database when found", async () => {
      const foundDb = {
        id: "db-1",
        name: "test-db",
        title: "Test DB",
        spaceId: "space-1",
        sectionId: null,
        isLocked: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockDatabaseRepo.findById.mockResolvedValue(foundDb);

      const result = await service.findOne("db-1");

      expect(result).toBeDefined();
      expect(result.id).toBe("db-1");
    });

    it("TC-DB-U-003: should throw NotFoundException when database not found", async () => {
      mockDatabaseRepo.findById.mockResolvedValue(null);

      await expect(service.findOne("nonexistent")).rejects.toThrow(NotFoundException);
    });
  });

  describe("update", () => {
    it("TC-DB-U-004: should throw NotFoundException when sectionId is invalid", async () => {
      mockDatabaseRepo.findById.mockResolvedValue({
        id: "db-1",
        name: "test-db",
        spaceId: "space-1",
        sectionId: null,
      });
      mockDatabaseRepo.findSectionInSpace.mockResolvedValue(null);

      await expect(service.update("db-1", { sectionId: "invalid-section" })).rejects.toThrow(NotFoundException);
    });

    it("TC-DB-U-004: should update database successfully with valid sectionId", async () => {
      mockDatabaseRepo.findById.mockResolvedValue({
        id: "db-1",
        name: "test-db",
        spaceId: "space-1",
        sectionId: "sec-1",
      });
      mockDatabaseRepo.findSectionInSpace.mockResolvedValue({ id: "sec-2", spaceId: "space-1" });
      mockDatabaseRepo.update.mockResolvedValue({
        id: "db-1",
        name: "updated-db",
        title: "Updated DB",
        spaceId: "space-1",
        sectionId: "sec-2",
        isLocked: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await service.update("db-1", { name: "updated-db", title: "Updated DB", sectionId: "sec-2" });

      expect(result).toBeDefined();
      expect(databaseRepo.update).toHaveBeenCalledWith("db-1", expect.any(Object));
    });

    it("TC-DB-U-004: should throw NotFoundException when database not found", async () => {
      mockDatabaseRepo.findById.mockResolvedValue(null);

      await expect(service.update("nonexistent", { name: "New Name" })).rejects.toThrow(NotFoundException);
    });
  });

  describe("remove", () => {
    it("TC-DB-U-005: should throw NotFoundException when database does not exist", async () => {
      mockDatabaseRepo.findById.mockResolvedValue(null);

      await expect(service.remove("nonexistent")).rejects.toThrow(NotFoundException);
    });

    it("TC-DB-U-005: should delete database successfully", async () => {
      mockDatabaseRepo.findById.mockResolvedValue({
        id: "db-1",
        name: "test-db",
        spaceId: "space-1",
        sectionId: null,
      });
      mockDatabaseRepo.delete.mockResolvedValue({
        id: "db-1",
        name: "test-db",
        title: "Test DB",
        spaceId: "space-1",
        sectionId: null,
        isLocked: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await service.remove("db-1");

      expect(result).toBeDefined();
      expect(databaseRepo.delete).toHaveBeenCalledWith("db-1");
    });

    it("TC-DB-U-006: should throw BadRequestException when database is a preset", async () => {
      mockDatabaseRepo.findById.mockResolvedValue({
        id: "db-1",
        name: "test-db",
        spaceId: "space-1",
        sectionId: null,
        isPreset: true,
      });

      await expect(service.remove("db-1")).rejects.toThrow(BadRequestException);
    });
  });
});
