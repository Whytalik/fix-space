import { NotFoundException } from "@nestjs/common";
import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import type { TestingModule } from "@nestjs/testing";
import { Test } from "@nestjs/testing";
import { AppLogger } from "@/common/logger/app-logger.service";
import { StorageService } from "@/core/storage/storage.service";
import { DatabaseRepository } from "@/modules/database/repositories/database.repository";
import { PropertyRepository } from "@/modules/property/repositories/property.repository";
import { TemplateService } from "../template.service";
import { TemplateRepository } from "../repositories/template.repository";

jest.mock("@fixspace/database", () => ({
  Prisma: {
    JsonNull: "JsonNull",
    DbNull: "DbNull",
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
    templatePropertyValue: {
      create: jest.fn(),
      deleteMany: jest.fn(),
      createMany: jest.fn(),
    },
    property: {
      findMany: jest.fn(),
    },
    $transaction: jest.fn((callback: (tx: unknown) => unknown) => callback(prisma)),
  },
}));

import { prisma } from "@fixspace/database";

describe("TemplateService", () => {
  let service: TemplateService;
  let templateRepo: jest.Mocked<TemplateRepository>;

  const mockLogger = {
    setContext: jest.fn(),
    debug: jest.fn(),
    log: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  } as unknown as jest.Mocked<AppLogger>;

  const mockStorageService = {
    saveContentImage: jest.fn(),
    saveAvatar: jest.fn(),
    removeAvatarFiles: jest.fn(),
  };

  const mockDatabaseRepo = {
    findDatabaseByOwner: jest.fn(),
  };

  const mockPropertyRepo = {
    findManyByDatabase: jest.fn(),
  };

  const mockTemplateRepo = {
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
        { provide: StorageService, useValue: mockStorageService },
        { provide: DatabaseRepository, useValue: mockDatabaseRepo },
        { provide: PropertyRepository, useValue: mockPropertyRepo },
        { provide: AppLogger, useValue: mockLogger },
      ],
    }).compile();

    service = module.get<TemplateService>(TemplateService);
    templateRepo = module.get(TemplateRepository);

    jest.clearAllMocks();
  });

  describe("create", () => {
    it("TC-TMPL-U-057: should throw NotFoundException if database not found", async () => {
      mockDatabaseRepo.findDatabaseByOwner.mockResolvedValue(null);

      await expect(service.create("db-1", { databaseId: "db-1", name: "Tpl" }, "user-1")).rejects.toThrow(NotFoundException);
    });

    it("TC-TMPL-U-002: should create template with property values", async () => {
      mockDatabaseRepo.findDatabaseByOwner.mockResolvedValue({ id: "db-1", spaceId: "space-1", ownerId: "user-1" });
      mockTemplateRepo.count.mockResolvedValue(0);
      mockTemplateRepo.create.mockResolvedValue({
        id: "tpl-1",
        name: "My Template",
        databaseId: "db-1",
        isDefault: true,
        position: 0,
      });
      mockPropertyRepo.findManyByDatabase.mockResolvedValue([{ id: "prop-1", name: "Name", type: "TEXT", databaseId: "db-1" }]);
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

    it("TC-TMPL-U-058: should set isDefault to true for first template", async () => {
      mockDatabaseRepo.findDatabaseByOwner.mockResolvedValue({ id: "db-1", spaceId: "space-1", ownerId: "user-1" });
      mockTemplateRepo.count.mockResolvedValue(0);
      mockTemplateRepo.create.mockResolvedValue({ id: "tpl-1", name: "First Template", databaseId: "db-1", isDefault: true });
      mockPropertyRepo.findManyByDatabase.mockResolvedValue([]);
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

    it("TC-TMPL-U-059: should reset other defaults when creating new default", async () => {
      mockDatabaseRepo.findDatabaseByOwner.mockResolvedValue({ id: "db-1", spaceId: "space-1", ownerId: "user-1" });
      mockTemplateRepo.count.mockResolvedValue(1);
      mockTemplateRepo.create.mockResolvedValue({ id: "tpl-2", name: "New Default", databaseId: "db-1", isDefault: true });
      mockPropertyRepo.findManyByDatabase.mockResolvedValue([]);
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

  describe("findAll", () => {
    it("TC-TMPL-U-060: should return all templates in database", async () => {
      mockTemplateRepo.findAllByDatabase.mockResolvedValue([{ id: "tpl-1", name: "Tpl" }] as any);

      const result = await service.findAll("db-1", "user-1");

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe("tpl-1");
      expect(mockTemplateRepo.findAllByDatabase).toHaveBeenCalledWith("db-1", "user-1");
    });
  });

  describe("findOne", () => {
    it("TC-TMPL-U-061: should throw NotFoundException if template not found", async () => {
      mockTemplateRepo.findByIdWithValues.mockResolvedValue(null);

      await expect(service.findOne("nonexistent")).rejects.toThrow(NotFoundException);
    });

    it("TC-TMPL-U-062: should return template with values when found", async () => {
      mockTemplateRepo.findByIdWithValues.mockResolvedValue({ id: "tpl-1", name: "Tpl" } as any);

      const result = await service.findOne("tpl-1");

      expect(result.id).toBe("tpl-1");
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

    it("TC-TMPL-U-063: should assign new default when old default is removed", async () => {
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

    it("TC-TMPL-U-064: should throw NotFoundException when template not found", async () => {
      mockTemplateRepo.findById.mockResolvedValue(null);

      await expect(service.update("nonexistent", { name: "New Name" })).rejects.toThrow(NotFoundException);
    });
  });

  describe("remove", () => {
    it("TC-TMPL-U-065: should throw NotFoundException when deleting non-existent template", async () => {
      mockTemplateRepo.findById.mockResolvedValue(null);

      await expect(service.remove("nonexistent")).rejects.toThrow(NotFoundException);
    });

    it("TC-TMPL-U-066: should delete template successfully and set next default if deleted was default", async () => {
      mockTemplateRepo.findById.mockResolvedValue({ id: "tpl-1", databaseId: "db-1", isDefault: true });
      mockTemplateRepo.delete.mockResolvedValue({ id: "tpl-1", isDefault: true } as any);
      mockTemplateRepo.findFirstInDatabase.mockResolvedValue({ id: "tpl-2", databaseId: "db-1" });

      const result = await service.remove("tpl-1");

      expect(result.id).toBe("tpl-1");
      expect(mockTemplateRepo.delete).toHaveBeenCalledWith("tpl-1", { values: true }, prisma);
      expect(mockTemplateRepo.findFirstInDatabase).toHaveBeenCalledWith("db-1", prisma);
      expect(mockTemplateRepo.update).toHaveBeenCalledWith("tpl-2", { isDefault: true }, undefined, prisma);
    });
  });

  describe("reset", () => {
    it("TC-TMPL-U-067: should throw NotFoundException when resetting non-existent template", async () => {
      mockTemplateRepo.findById.mockResolvedValue(null);

      await expect(service.reset("nonexistent")).rejects.toThrow(NotFoundException);
    });

    it("TC-TMPL-U-068: should reset template property values and configuration", async () => {
      mockTemplateRepo.findById.mockResolvedValue({ id: "tpl-1", databaseId: "db-1" });
      (prisma.templatePropertyValue.deleteMany as jest.Mock<any>).mockResolvedValue({ count: 1 });
      (prisma.property.findMany as jest.Mock<any>).mockResolvedValue([{ id: "prop-1" }]);
      (prisma.templatePropertyValue.createMany as jest.Mock<any>).mockResolvedValue({ count: 1 });
      mockTemplateRepo.update.mockResolvedValue({ id: "tpl-1", content: {}, config: {} } as any);

      const result = await service.reset("tpl-1");

      expect(result.id).toBe("tpl-1");
      expect(prisma.templatePropertyValue.deleteMany).toHaveBeenCalledWith({ where: { templateId: "tpl-1" } });
      expect(prisma.templatePropertyValue.createMany).toHaveBeenCalledWith({
        data: [{ templateId: "tpl-1", propertyId: "prop-1", value: "DbNull" }],
      });
      expect(mockTemplateRepo.update).toHaveBeenCalledWith("tpl-1", { content: {} }, undefined, prisma);
    });
  });

  describe("uploadImage", () => {
    it("TC-TMPL-U-069: should save image and return url", async () => {
      const file = { buffer: Buffer.from(""), originalname: "file.png" } as any;
      mockStorageService.saveContentImage.mockResolvedValue("http://storage/file.png");

      const result = await service.uploadImage("tpl-1", file);

      expect(result.url).toBe("http://storage/file.png");
      expect(mockStorageService.saveContentImage).toHaveBeenCalledWith(file);
    });
  });
});
