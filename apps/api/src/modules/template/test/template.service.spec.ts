import { NotFoundException } from "@nestjs/common";
import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import type { TestingModule } from "@nestjs/testing";
import { Test } from "@nestjs/testing";
import { AppLogger } from "@/common/logger/app-logger.service";
import { TemplateService } from "../template.service";
import { TemplateRepository } from "../repositories/template.repository";

jest.mock("@fixspace/database", () => ({
  Prisma: {
    JsonNull: "JsonNull",
    InputJsonValue: undefined,
  },
  prisma: {
    space: { findFirst: jest.fn() },
    database: { findFirst: jest.fn() },
    template: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
      delete: jest.fn(),
    },
    templatePropertyValue: { create: jest.fn() },
    $transaction: jest.fn((callback: (tx: unknown) => unknown) => callback(prisma)),
  },
}));

import { prisma } from "@fixspace/database";

describe("TemplateService", () => {
  let service: TemplateService;
  let templateRepo: jest.Mocked<TemplateRepository>;

  const mockLogger: jest.Mocked<AppLogger> = {
    setContext: jest.fn(),
    debug: jest.fn(),
    log: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  } as unknown as jest.Mocked<AppLogger>;

  const mockTemplateRepo = {
    findDatabaseByOwner: jest.fn(),
    findPropertiesByDatabase: jest.fn(),
    count: jest.fn(),
    findById: jest.fn(),
    findByIdWithValues: jest.fn(),
    findUniqueOrThrowWithValues: jest.fn(),
    findAllByDatabase: jest.fn(),
    findDefaultInDatabase: jest.fn(),
    findFirstInDatabase: jest.fn(),
    updateMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    transaction: jest.fn((callback) => callback(prisma)),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TemplateService,
        { provide: TemplateRepository, useValue: mockTemplateRepo },
        { provide: AppLogger, useValue: mockLogger },
      ],
    }).compile();

    service = module.get<TemplateService>(TemplateService);
    templateRepo = module.get(TemplateRepository);

    jest.clearAllMocks();
  });

  describe("create", () => {
    it("TC-TMPL-U-002: should create template with property values", async () => {
      mockTemplateRepo.findDatabaseByOwner.mockResolvedValue({ id: "db-1", spaceId: "space-1", ownerId: "user-1" });
      mockTemplateRepo.count.mockResolvedValue(0);
      mockTemplateRepo.create.mockResolvedValue({
        id: "tpl-1",
        name: "My Template",
        databaseId: "db-1",
        isDefault: true,
        position: 0,
      });
      mockTemplateRepo.findPropertiesByDatabase.mockResolvedValue([{ id: "prop-1", name: "Name", type: "TEXT", databaseId: "db-1" }]);
      (prisma.templatePropertyValue.create as jest.Mock<any>).mockResolvedValue({ id: "tpl-val-1" });
      mockTemplateRepo.findUniqueOrThrowWithValues.mockResolvedValue({
        id: "tpl-1",
        name: "My Template",
        databaseId: "db-1",
        isDefault: true,
        values: [],
      });

      const result = await service.create("db-1", { databaseId: "db-1", name: "My Template" }, "user-1");

      expect(result).toBeDefined();
      expect(result.id).toBe("tpl-1");
      expect(templateRepo.create).toHaveBeenCalledWith(expect.objectContaining({ name: "My Template", isDefault: true }), prisma);
      expect(prisma.templatePropertyValue.create).toHaveBeenCalled();
    });

    it("TC-TMPL-U-002: should set isDefault to true for first template", async () => {
      mockTemplateRepo.findDatabaseByOwner.mockResolvedValue({ id: "db-1", spaceId: "space-1", ownerId: "user-1" });
      mockTemplateRepo.count.mockResolvedValue(0);
      mockTemplateRepo.create.mockResolvedValue({ id: "tpl-1", name: "First Template", databaseId: "db-1", isDefault: true });
      mockTemplateRepo.findPropertiesByDatabase.mockResolvedValue([]);
      mockTemplateRepo.findUniqueOrThrowWithValues.mockResolvedValue({
        id: "tpl-1",
        name: "First Template",
        databaseId: "db-1",
        isDefault: true,
        values: [],
      });

      await service.create("db-1", { databaseId: "db-1", name: "First Template" }, "user-1");

      expect(templateRepo.create).toHaveBeenCalledWith(expect.objectContaining({ isDefault: true }), prisma);
    });

    it("TC-TMPL-U-002: should reset other defaults when creating new default", async () => {
      mockTemplateRepo.findDatabaseByOwner.mockResolvedValue({ id: "db-1", spaceId: "space-1", ownerId: "user-1" });
      mockTemplateRepo.count.mockResolvedValue(1);
      mockTemplateRepo.create.mockResolvedValue({ id: "tpl-2", name: "New Default", databaseId: "db-1", isDefault: true });
      mockTemplateRepo.findPropertiesByDatabase.mockResolvedValue([]);
      mockTemplateRepo.findUniqueOrThrowWithValues.mockResolvedValue({
        id: "tpl-2",
        name: "New Default",
        databaseId: "db-1",
        isDefault: true,
        values: [],
      });

      await service.create("db-1", { databaseId: "db-1", name: "New Default", isDefault: true }, "user-1");

      expect(templateRepo.updateMany).toHaveBeenCalledWith({ databaseId: "db-1", isDefault: true }, { isDefault: false }, prisma);
    });
  });

  describe("update", () => {
    it("TC-TMPL-U-003: should reset previous default when setting new default", async () => {
      mockTemplateRepo.findById.mockResolvedValue({
        id: "tpl-1",
        name: "Template",
        databaseId: "db-1",
        isDefault: false,
        position: 0,
      });
      mockTemplateRepo.update.mockResolvedValue({
        id: "tpl-1",
        name: "Template",
        databaseId: "db-1",
        isDefault: true,
        position: 0,
        values: [],
      });

      await service.update("tpl-1", { isDefault: true });

      expect(templateRepo.updateMany).toHaveBeenCalledWith({ databaseId: "db-1", isDefault: true }, { isDefault: false }, prisma);
    });

    it("TC-TMPL-U-003: should assign new default when old default is removed", async () => {
      mockTemplateRepo.findById.mockResolvedValue({
        id: "tpl-1",
        name: "Template",
        databaseId: "db-1",
        isDefault: true,
        position: 0,
      });
      mockTemplateRepo.findDefaultInDatabase.mockResolvedValue(null);
      mockTemplateRepo.findFirstInDatabase.mockResolvedValue({ id: "tpl-2", name: "Next Template", databaseId: "db-1" });
      mockTemplateRepo.update.mockResolvedValue({
        id: "tpl-1",
        name: "Template",
        databaseId: "db-1",
        isDefault: false,
        position: 0,
        values: [],
      });

      await service.update("tpl-1", { isDefault: false });

      expect(templateRepo.findDefaultInDatabase).toHaveBeenCalledWith("db-1", prisma);
      expect(templateRepo.findFirstInDatabase).toHaveBeenCalledWith("db-1", prisma);
      expect(templateRepo.update).toHaveBeenCalledWith("tpl-2", { isDefault: true }, undefined, prisma);
    });

    it("TC-TMPL-U-003: should throw NotFoundException when template not found", async () => {
      mockTemplateRepo.findById.mockResolvedValue(null);

      await expect(service.update("nonexistent", { name: "New Name" })).rejects.toThrow(NotFoundException);
    });
  });
});
