import { ForbiddenException, NotFoundException } from "@nestjs/common";
import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import type { TestingModule } from "@nestjs/testing";
import { Test } from "@nestjs/testing";
import { AppLogger } from "@/common/logger/app-logger.service";
import { PropertyGroupService } from "../property-group.service";
import { PropertyGroupRepository } from "../repositories/property-group.repository";
import { DatabaseRepository } from "@/modules/database/repositories/database.repository";

describe("PropertyGroupService", () => {
  let service: PropertyGroupService;

  const mockLogger = {
    setContext: jest.fn(),
    debug: jest.fn(),
    log: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  } as unknown as jest.Mocked<AppLogger>;

  const mockGroupRepo = {
    findById: jest.fn(),
    findAllByDatabase: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  } as unknown as jest.Mocked<PropertyGroupRepository>;

  const mockDatabaseRepo = {
    findDatabaseByOwner: jest.fn(),
  } as unknown as jest.Mocked<DatabaseRepository>;

  const mockDatabase = { id: "db-1", isLocked: false, space: { ownerId: "u-1" } };
  const mockGroup = { id: "g-1", databaseId: "db-1", name: "General", position: 0, visibility: null };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PropertyGroupService,
        { provide: AppLogger, useValue: mockLogger },
        { provide: PropertyGroupRepository, useValue: mockGroupRepo },
        { provide: DatabaseRepository, useValue: mockDatabaseRepo },
      ],
    }).compile();

    service = module.get<PropertyGroupService>(PropertyGroupService);
    jest.clearAllMocks();
  });

  describe("findAllByDatabase", () => {
    it("TC-PROPG-U-001: should throw NotFoundException when database not found", async () => {
      mockDatabaseRepo.findDatabaseByOwner.mockResolvedValue(null as any);

      await expect(service.findAllByDatabase("db-1", "u-1")).rejects.toThrow(NotFoundException);
      expect(mockGroupRepo.findAllByDatabase).not.toHaveBeenCalled();
    });

    it("TC-PROPG-U-002: should return all groups for database", async () => {
      mockDatabaseRepo.findDatabaseByOwner.mockResolvedValue(mockDatabase as any);
      mockGroupRepo.findAllByDatabase.mockResolvedValue([mockGroup] as any);

      const result = await service.findAllByDatabase("db-1", "u-1");

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe("g-1");
      expect(mockGroupRepo.findAllByDatabase).toHaveBeenCalledWith("db-1");
    });
  });

  describe("create", () => {
    it("TC-PROPG-U-003: should throw NotFoundException when database not found", async () => {
      mockDatabaseRepo.findDatabaseByOwner.mockResolvedValue(null as any);

      await expect(service.create("db-1", { name: "New Group", position: 0 }, "u-1")).rejects.toThrow(NotFoundException);
    });

    it("TC-PROPG-U-004: should throw ForbiddenException when database is locked", async () => {
      mockDatabaseRepo.findDatabaseByOwner.mockResolvedValue({ ...mockDatabase, isLocked: true } as any);

      await expect(service.create("db-1", { name: "New Group", position: 0 }, "u-1")).rejects.toThrow(ForbiddenException);
      expect(mockGroupRepo.create).not.toHaveBeenCalled();
    });

    it("TC-PROPG-U-005: should create and return property group", async () => {
      mockDatabaseRepo.findDatabaseByOwner.mockResolvedValue(mockDatabase as any);
      mockGroupRepo.create.mockResolvedValue(mockGroup as any);

      const result = await service.create("db-1", { name: "General", position: 0 }, "u-1");

      expect(result.id).toBe("g-1");
      expect(mockGroupRepo.create).toHaveBeenCalledWith(expect.objectContaining({ databaseId: "db-1", name: "General", position: 0 }));
    });
  });

  describe("update", () => {
    it("TC-PROPG-U-006: should throw NotFoundException when group not found", async () => {
      mockGroupRepo.findById.mockResolvedValue(null as any);

      await expect(service.update("g-999", { name: "Changed" }, "u-1")).rejects.toThrow(NotFoundException);
      expect(mockDatabaseRepo.findDatabaseByOwner).not.toHaveBeenCalled();
    });

    it("TC-PROPG-U-007: should throw ForbiddenException when user is not database owner", async () => {
      mockGroupRepo.findById.mockResolvedValue(mockGroup as any);
      mockDatabaseRepo.findDatabaseByOwner.mockResolvedValue(null as any);

      await expect(service.update("g-1", { name: "Changed" }, "other-user")).rejects.toThrow(ForbiddenException);
    });

    it("TC-PROPG-U-008: should throw ForbiddenException when database is locked", async () => {
      mockGroupRepo.findById.mockResolvedValue(mockGroup as any);
      mockDatabaseRepo.findDatabaseByOwner.mockResolvedValue({ ...mockDatabase, isLocked: true } as any);

      await expect(service.update("g-1", { name: "Changed" }, "u-1")).rejects.toThrow(ForbiddenException);
    });

    it("TC-PROPG-U-009: should update and return property group", async () => {
      const updated = { ...mockGroup, name: "Changed" };
      mockGroupRepo.findById.mockResolvedValue(mockGroup as any);
      mockDatabaseRepo.findDatabaseByOwner.mockResolvedValue(mockDatabase as any);
      mockGroupRepo.update.mockResolvedValue(updated as any);

      const result = await service.update("g-1", { name: "Changed" }, "u-1");

      expect(result.name).toBe("Changed");
      expect(mockGroupRepo.update).toHaveBeenCalledWith("g-1", expect.objectContaining({ name: "Changed" }));
    });
  });

  describe("remove", () => {
    it("TC-PROPG-U-010: should throw NotFoundException when group not found", async () => {
      mockGroupRepo.findById.mockResolvedValue(null as any);

      await expect(service.remove("g-999", "u-1")).rejects.toThrow(NotFoundException);
    });

    it("TC-PROPG-U-011: should throw ForbiddenException when user is not database owner", async () => {
      mockGroupRepo.findById.mockResolvedValue(mockGroup as any);
      mockDatabaseRepo.findDatabaseByOwner.mockResolvedValue(null as any);

      await expect(service.remove("g-1", "other-user")).rejects.toThrow(ForbiddenException);
    });

    it("TC-PROPG-U-012: should throw ForbiddenException when database is locked", async () => {
      mockGroupRepo.findById.mockResolvedValue(mockGroup as any);
      mockDatabaseRepo.findDatabaseByOwner.mockResolvedValue({ ...mockDatabase, isLocked: true } as any);

      await expect(service.remove("g-1", "u-1")).rejects.toThrow(ForbiddenException);
    });

    it("TC-PROPG-U-013: should delete the property group", async () => {
      mockGroupRepo.findById.mockResolvedValue(mockGroup as any);
      mockDatabaseRepo.findDatabaseByOwner.mockResolvedValue(mockDatabase as any);
      mockGroupRepo.delete.mockResolvedValue(undefined as any);

      await service.remove("g-1", "u-1");

      expect(mockGroupRepo.delete).toHaveBeenCalledWith("g-1");
    });
  });
});
