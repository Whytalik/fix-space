import { BadRequestException, ForbiddenException, NotFoundException } from "@nestjs/common";
import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import type { TestingModule } from "@nestjs/testing";
import { Test } from "@nestjs/testing";
import { AppLogger } from "@/common/logger/app-logger.service";
import { SettingsService } from "@/modules/settings/settings.service";
import { ViewService } from "../view.service";
import { ViewRepository } from "../repositories/view.repository";

jest.mock("@fixspace/database", () => ({
  prisma: {
    database: {
      findFirst: jest.fn(),
    },
  },
}));

import { prisma } from "@fixspace/database";

describe("ViewService", () => {
  let service: ViewService;

  const mockLogger = {
    setContext: jest.fn(),
    debug: jest.fn(),
    log: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  } as unknown as jest.Mocked<AppLogger>;

  const mockViewRepo = {
    findAllByDatabase: jest.fn(),
    findById: jest.fn(),
    countByDatabase: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  } as unknown as jest.Mocked<ViewRepository>;

  const mockSettingsService = {
    resolveDefaults: jest.fn(),
  } as unknown as jest.Mocked<SettingsService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ViewService,
        { provide: AppLogger, useValue: mockLogger },
        { provide: ViewRepository, useValue: mockViewRepo },
        { provide: SettingsService, useValue: mockSettingsService },
      ],
    }).compile();

    service = module.get<ViewService>(ViewService);
    jest.clearAllMocks();
  });

  describe("findAll", () => {
    it("TC-VIEW-U-012: should return all views for a database", async () => {
      mockViewRepo.findAllByDatabase.mockResolvedValue([{ id: "v-1", databaseId: "db-1", name: "Table" }] as any);

      const result = await service.findAll("db-1");

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe("v-1");
      expect(mockViewRepo.findAllByDatabase).toHaveBeenCalledWith("db-1");
    });

    it("TC-VIEW-U-012b: should throw NotFoundException when database does not belong to user", async () => {
      (prisma.database.findFirst as jest.Mock<any>).mockResolvedValue(null);

      await expect(service.findAll("db-1", "user-1")).rejects.toThrow(NotFoundException);
    });
  });

  describe("findOne", () => {
    it("TC-VIEW-U-013: should throw NotFoundException when view not found", async () => {
      mockViewRepo.findById.mockResolvedValue(null);

      await expect(service.findOne("nonexistent")).rejects.toThrow(NotFoundException);
    });

    it("TC-VIEW-U-014: should return view when found", async () => {
      mockViewRepo.findById.mockResolvedValue({ id: "v-1", databaseId: "db-1", name: "Table" } as any);

      const result = await service.findOne("v-1");

      expect(result.id).toBe("v-1");
    });
  });

  describe("create", () => {
    it("TC-VIEW-U-015: should throw BadRequestException when view limit (5) reached", async () => {
      mockViewRepo.countByDatabase.mockResolvedValue(5);

      await expect(service.create("db-1", { name: "New View" }, "user-1")).rejects.toThrow(BadRequestException);
    });

    it("TC-VIEW-U-016: should create a new view successfully", async () => {
      mockViewRepo.countByDatabase.mockResolvedValue(2);
      mockSettingsService.resolveDefaults.mockResolvedValue({ icon: "table-icon" });
      mockViewRepo.create.mockResolvedValue({
        id: "v-3",
        databaseId: "db-1",
        name: "New View",
        icon: "table-icon",
        position: 2,
        isLocked: false,
        pageSize: 50,
        useDefaultTemplate: true,
      } as any);

      const result = await service.create("db-1", { name: "New View" }, "user-1");

      expect(result.id).toBe("v-3");
      expect(mockViewRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          databaseId: "db-1",
          name: "New View",
          icon: "table-icon",
          position: 2,
        }),
      );
    });
  });

  describe("update", () => {
    it("TC-VIEW-U-017: should throw NotFoundException when updating non-existent view", async () => {
      mockViewRepo.findById.mockResolvedValue(null);

      await expect(service.update("nonexistent", { name: "New" })).rejects.toThrow(NotFoundException);
    });

    it("TC-VIEW-U-018: should throw ForbiddenException when updating locked view with functional changes", async () => {
      mockViewRepo.findById.mockResolvedValue({ id: "v-1", isLocked: true } as any);

      await expect(service.update("v-1", { filters: [] })).rejects.toThrow(ForbiddenException);
    });

    it("TC-VIEW-U-019: should update locked view when changes are not functional (e.g. rename)", async () => {
      mockViewRepo.findById.mockResolvedValue({ id: "v-1", isLocked: true } as any);
      mockViewRepo.update.mockResolvedValue({ id: "v-1", name: "Renamed View", isLocked: true } as any);

      const result = await service.update("v-1", { name: "Renamed View" });

      expect(result.name).toBe("Renamed View");
    });

    it("TC-VIEW-U-019b: should throw ForbiddenException when updating locked view with filterLogic change", async () => {
      mockViewRepo.findById.mockResolvedValue({ id: "v-1", isLocked: true } as any);

      await expect(service.update("v-1", { filterLogic: "OR" })).rejects.toThrow(ForbiddenException);
    });

    it("TC-VIEW-U-019c: should throw ForbiddenException when updating locked view with hiddenColumns change", async () => {
      mockViewRepo.findById.mockResolvedValue({ id: "v-1", isLocked: true } as any);

      await expect(service.update("v-1", { hiddenColumns: ["col1"] })).rejects.toThrow(ForbiddenException);
    });

    it("TC-VIEW-U-019d: should throw ForbiddenException when updating locked view with searchQuery change", async () => {
      mockViewRepo.findById.mockResolvedValue({ id: "v-1", isLocked: true } as any);

      await expect(service.update("v-1", { searchQuery: "test" })).rejects.toThrow(ForbiddenException);
    });

    it("TC-VIEW-U-019e: should throw ForbiddenException when updating locked view with recordLimit change", async () => {
      mockViewRepo.findById.mockResolvedValue({ id: "v-1", isLocked: true } as any);

      await expect(service.update("v-1", { recordLimit: 10 })).rejects.toThrow(ForbiddenException);
    });

    it("TC-VIEW-U-020: should update view successfully", async () => {
      mockViewRepo.findById.mockResolvedValue({ id: "v-1", isLocked: false } as any);
      mockViewRepo.update.mockResolvedValue({ id: "v-1", name: "Updated View" } as any);

      const result = await service.update("v-1", { name: "Updated View" });

      expect(result.name).toBe("Updated View");
    });
  });

  describe("delete", () => {
    it("TC-VIEW-U-021: should throw NotFoundException when deleting non-existent view", async () => {
      mockViewRepo.findById.mockResolvedValue(null);

      await expect(service.delete("nonexistent")).rejects.toThrow(NotFoundException);
    });

    it("TC-VIEW-U-022: should throw BadRequestException when deleting the last view in database", async () => {
      mockViewRepo.findById.mockResolvedValue({ id: "v-1", databaseId: "db-1" } as any);
      mockViewRepo.countByDatabase.mockResolvedValue(1);

      await expect(service.delete("v-1")).rejects.toThrow(BadRequestException);
    });

    it("TC-VIEW-U-023: should delete view successfully", async () => {
      mockViewRepo.findById.mockResolvedValue({ id: "v-1", databaseId: "db-1" } as any);
      mockViewRepo.countByDatabase.mockResolvedValue(2);
      mockViewRepo.delete.mockResolvedValue({ id: "v-1" } as any);

      const result = await service.delete("v-1");

      expect(result.id).toBe("v-1");
    });
  });

  describe("reorder", () => {
    it("TC-VIEW-U-024: should update positions and return updated list", async () => {
      mockViewRepo.update.mockResolvedValue({} as any);
      mockViewRepo.findAllByDatabase.mockResolvedValue([
        { id: "v-1", position: 1 },
        { id: "v-2", position: 2 },
      ] as any);

      const result = await service.reorder("db-1", [
        { id: "v-1", position: 1 },
        { id: "v-2", position: 2 },
      ]);

      expect(result).toHaveLength(2);
      expect(mockViewRepo.update).toHaveBeenCalledTimes(2);
    });
  });

  describe("duplicate", () => {
    it("TC-VIEW-U-025: should throw NotFoundException when source view not found", async () => {
      mockViewRepo.findById.mockResolvedValue(null);

      await expect(service.duplicate("nonexistent")).rejects.toThrow(NotFoundException);
    });

    it("TC-VIEW-U-026: should throw BadRequestException when view limit reached during duplication", async () => {
      mockViewRepo.findById.mockResolvedValue({ id: "v-1", databaseId: "db-1" } as any);
      mockViewRepo.countByDatabase.mockResolvedValue(5);

      await expect(service.duplicate("v-1")).rejects.toThrow(BadRequestException);
    });

    it("TC-VIEW-U-027: should duplicate view successfully", async () => {
      mockViewRepo.findById.mockResolvedValue({
        id: "v-1",
        databaseId: "db-1",
        name: "My View",
        icon: "icon",
        pageSize: 50,
      } as any);
      mockViewRepo.countByDatabase.mockResolvedValue(3);
      mockViewRepo.create.mockResolvedValue({
        id: "v-copy",
        databaseId: "db-1",
        name: "My View (Copy)",
        icon: "icon",
        pageSize: 50,
      } as any);

      const result = await service.duplicate("v-1");

      expect(result.name).toBe("My View (Copy)");
      expect(mockViewRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          name: "My View (Copy)",
          databaseId: "db-1",
        }),
      );
    });
  });
});
