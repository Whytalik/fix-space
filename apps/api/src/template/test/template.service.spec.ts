import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { NotFoundException } from "@nestjs/common";
import type { TestingModule } from "@nestjs/testing";
import { Test } from "@nestjs/testing";
import { Prisma } from "@nucleus/database";
import type { CreateTemplateDto } from "@nucleus/domain";
import { AppLogger } from "../../common/logger/app-logger.service";
import { TemplateRepository } from "../template.repository";
import { TemplateService } from "../template.service";

const mockLogger = {
  setContext: jest.fn<any>(),
  debug: jest.fn<any>(),
  log: jest.fn<any>(),
  warn: jest.fn<any>(),
  error: jest.fn<any>(),
};

const mockTemplateRepo = {
  findDatabaseByOwner: jest.fn<any>(),
  findPropertiesByDatabase: jest.fn<any>(),
  findByIdWithOwner: jest.fn<any>(),
  findAllByDatabase: jest.fn<any>(),
  count: jest.fn<any>(),
  create: jest.fn<any>(),
  findUniqueOrThrowWithValues: jest.fn<any>(),
  update: jest.fn<any>(),
  updateMany: jest.fn<any>(),
  findFirstInDatabase: jest.fn<any>(),
  findDefaultInDatabase: jest.fn<any>(),
  delete: jest.fn<any>(),
  transaction: jest.fn<any>(),
};

const mockDatabase = { id: "db-1", spaceId: "space-1" };
const mockProperty = { id: "prop-1", databaseId: "db-1" };
const mockTemplate = {
  id: "tmpl-1",
  databaseId: "db-1",
  name: "My Template",
  description: null,
  icon: null,
  isDefault: false,
  position: 0,
  createdAt: new Date(),
  updatedAt: new Date(),
  config: null,
  values: [],
};

describe("TemplateService", () => {
  let service: TemplateService;
  let fakeTx: { templatePropertyValue: { create: ReturnType<typeof jest.fn> } };

  beforeEach(async () => {
    jest.clearAllMocks();

    fakeTx = {
      templatePropertyValue: {
        create: jest.fn<any>().mockResolvedValue({}),
      },
    };
    mockTemplateRepo.transaction.mockImplementation(
      async (cb: (tx: typeof fakeTx) => Promise<unknown>) => cb(fakeTx),
    );

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TemplateService,
        { provide: AppLogger, useValue: mockLogger },
        { provide: TemplateRepository, useValue: mockTemplateRepo },
      ],
    }).compile();

    service = module.get<TemplateService>(TemplateService);
  });

  describe("create", () => {
    it("should create a template with property values", async () => {
      const dto: CreateTemplateDto = { databaseId: "db-1", name: "My Template" };

      mockTemplateRepo.findDatabaseByOwner.mockResolvedValue(mockDatabase);
      mockTemplateRepo.findPropertiesByDatabase.mockResolvedValue([mockProperty]);
      mockTemplateRepo.count.mockResolvedValue(1);
      mockTemplateRepo.updateMany.mockResolvedValue({ count: 0 });
      mockTemplateRepo.create.mockResolvedValue(mockTemplate);
      mockTemplateRepo.findUniqueOrThrowWithValues.mockResolvedValue(mockTemplate);

      const result = await service.create("db-1", dto, "user-1");

      expect(result.id).toBe("tmpl-1");
      expect(mockTemplateRepo.create).toHaveBeenCalled();
    });

    it("should throw NotFoundException when database not found", async () => {
      mockTemplateRepo.findDatabaseByOwner.mockResolvedValue(null);

      await expect(service.create("nonexistent", { databaseId: "nonexistent" }, "user-1")).rejects.toThrow(
        NotFoundException,
      );
    });

    it("should clear existing defaults when isDefault is true", async () => {
      const dto: CreateTemplateDto = { databaseId: "db-1", isDefault: true };

      mockTemplateRepo.findDatabaseByOwner.mockResolvedValue(mockDatabase);
      mockTemplateRepo.findPropertiesByDatabase.mockResolvedValue([]);
      mockTemplateRepo.count.mockResolvedValue(1);
      mockTemplateRepo.updateMany.mockResolvedValue({ count: 1 });
      mockTemplateRepo.create.mockResolvedValue({ ...mockTemplate, isDefault: true });
      mockTemplateRepo.findUniqueOrThrowWithValues.mockResolvedValue({ ...mockTemplate, isDefault: true });

      await service.create("db-1", dto, "user-1");

      expect(mockTemplateRepo.updateMany).toHaveBeenCalledWith(
        { databaseId: "db-1", isDefault: true },
        { isDefault: false },
        expect.anything(),
      );
    });

    it("should create template property values for each property", async () => {
      const dto: CreateTemplateDto = { databaseId: "db-1", name: "T" };

      mockTemplateRepo.findDatabaseByOwner.mockResolvedValue(mockDatabase);
      mockTemplateRepo.findPropertiesByDatabase.mockResolvedValue([mockProperty]);
      mockTemplateRepo.count.mockResolvedValue(0);
      mockTemplateRepo.updateMany.mockResolvedValue({ count: 0 });
      mockTemplateRepo.create.mockResolvedValue(mockTemplate);
      mockTemplateRepo.findUniqueOrThrowWithValues.mockResolvedValue(mockTemplate);

      await service.create("db-1", dto, "user-1");

      expect(fakeTx.templatePropertyValue.create).toHaveBeenCalledWith({
        data: { templateId: "tmpl-1", propertyId: "prop-1", value: Prisma.JsonNull },
      });
    });
  });

  describe("findAll", () => {
    it("should return all templates for a database", async () => {
      mockTemplateRepo.findAllByDatabase.mockResolvedValue([mockTemplate]);

      const result = await service.findAll("db-1", "user-1");

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe("tmpl-1");
      expect(mockTemplateRepo.findAllByDatabase).toHaveBeenCalledWith("db-1", "user-1");
    });

    it("should return empty array when no templates", async () => {
      mockTemplateRepo.findAllByDatabase.mockResolvedValue([]);

      const result = await service.findAll("db-1", "user-1");

      expect(result).toEqual([]);
    });
  });

  describe("findOne", () => {
    it("should return a single template", async () => {
      mockTemplateRepo.findByIdWithOwner.mockResolvedValue(mockTemplate);
      mockTemplateRepo.findUniqueOrThrowWithValues.mockResolvedValue(mockTemplate);

      const result = await service.findOne("tmpl-1", "user-1");

      expect(result.id).toBe("tmpl-1");
    });

    it("should throw NotFoundException when template not found", async () => {
      mockTemplateRepo.findByIdWithOwner.mockResolvedValue(null);

      await expect(service.findOne("nonexistent", "user-1")).rejects.toThrow(NotFoundException);
      await expect(service.findOne("nonexistent", "user-1")).rejects.toThrow("Template with id nonexistent not found");
    });
  });

  describe("update", () => {
    it("should update template metadata", async () => {
      const updatedTemplate = { ...mockTemplate, name: "Updated", values: [] };
      mockTemplateRepo.findByIdWithOwner.mockResolvedValue(mockTemplate);
      mockTemplateRepo.updateMany.mockResolvedValue({ count: 0 });
      mockTemplateRepo.update.mockResolvedValue(updatedTemplate);

      const result = await service.update("tmpl-1", { name: "Updated" }, "user-1");

      expect(result.name).toBe("Updated");
      expect(mockTemplateRepo.update).toHaveBeenCalled();
    });

    it("should clear existing defaults when isDefault is true", async () => {
      mockTemplateRepo.findByIdWithOwner.mockResolvedValue(mockTemplate);
      mockTemplateRepo.updateMany.mockResolvedValue({ count: 1 });
      mockTemplateRepo.update.mockResolvedValue({ ...mockTemplate, isDefault: true, values: [] });

      await service.update("tmpl-1", { isDefault: true }, "user-1");

      expect(mockTemplateRepo.updateMany).toHaveBeenCalledWith(
        { databaseId: "db-1", isDefault: true },
        { isDefault: false },
        expect.anything(),
      );
    });

    it("should promote next template when isDefault is set to false and none remain", async () => {
      const nextTemplate = { ...mockTemplate, id: "tmpl-2", position: 1 };
      mockTemplateRepo.findByIdWithOwner.mockResolvedValue(mockTemplate);
      mockTemplateRepo.updateMany.mockResolvedValue({ count: 0 });
      mockTemplateRepo.update.mockResolvedValue({ ...mockTemplate, isDefault: false, values: [] });
      mockTemplateRepo.findDefaultInDatabase.mockResolvedValue(null);
      mockTemplateRepo.findFirstInDatabase.mockResolvedValue(nextTemplate);

      await service.update("tmpl-1", { isDefault: false }, "user-1");

      expect(mockTemplateRepo.update).toHaveBeenCalledWith(
        "tmpl-2",
        { isDefault: true },
        undefined,
        expect.anything(),
      );
    });

    it("should throw NotFoundException when template not found", async () => {
      mockTemplateRepo.findByIdWithOwner.mockResolvedValue(null);

      await expect(service.update("nonexistent", { name: "X" }, "user-1")).rejects.toThrow(NotFoundException);
    });
  });

  describe("remove", () => {
    it("should delete a template", async () => {
      mockTemplateRepo.findByIdWithOwner.mockResolvedValue(mockTemplate);
      mockTemplateRepo.delete.mockResolvedValue(mockTemplate);
      mockTemplateRepo.findFirstInDatabase.mockResolvedValue(null);

      const result = await service.remove("tmpl-1", "user-1");

      expect(result.id).toBe("tmpl-1");
      expect(mockTemplateRepo.delete).toHaveBeenCalledWith("tmpl-1", { values: true }, expect.anything());
    });

    it("should promote next template to default when deleting the default one", async () => {
      const defaultTemplate = { ...mockTemplate, isDefault: true };
      const nextTemplate = { ...mockTemplate, id: "tmpl-2", position: 1 };

      mockTemplateRepo.findByIdWithOwner.mockResolvedValue(defaultTemplate);
      mockTemplateRepo.delete.mockResolvedValue(defaultTemplate);
      mockTemplateRepo.findFirstInDatabase.mockResolvedValue(nextTemplate);
      mockTemplateRepo.update.mockResolvedValue({ ...nextTemplate, isDefault: true });

      await service.remove("tmpl-1", "user-1");

      expect(mockTemplateRepo.update).toHaveBeenCalledWith(
        "tmpl-2",
        { isDefault: true },
        undefined,
        expect.anything(),
      );
    });

    it("should throw NotFoundException when template not found", async () => {
      mockTemplateRepo.findByIdWithOwner.mockResolvedValue(null);

      await expect(service.remove("nonexistent", "user-1")).rejects.toThrow(NotFoundException);
    });

    it("should rethrow unknown errors", async () => {
      mockTemplateRepo.findByIdWithOwner.mockResolvedValue(mockTemplate);
      mockTemplateRepo.delete.mockRejectedValue(new Error("DB error"));

      await expect(service.remove("tmpl-1", "user-1")).rejects.toThrow("DB error");
    });
  });
});
