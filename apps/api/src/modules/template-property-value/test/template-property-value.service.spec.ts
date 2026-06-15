import { BadRequestException, ConflictException, NotFoundException } from "@nestjs/common";
import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import type { TestingModule } from "@nestjs/testing";
import { Test } from "@nestjs/testing";
import { AppLogger } from "@/common/logger/app-logger.service";
import { PropertyTypeRegistry } from "@/modules/property/types";
import { TemplateRepository } from "@/modules/template/repositories/template.repository";
import { PropertyRepository } from "@/modules/property/repositories/property.repository";
import { TemplatePropertyValueService } from "../template-property-value.service";
import { TemplatePropertyValueRepository } from "../repositories/template-property-value.repository";

jest.mock("@fixspace/database", () => ({
  prisma: {
    templatePropertyValue: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  },
}));

describe("TemplatePropertyValueService", () => {
  let service: TemplatePropertyValueService;

  const mockLogger = {
    setContext: jest.fn(),
    debug: jest.fn(),
    log: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  } as unknown as jest.Mocked<AppLogger>;

  const mockHandler = {
    type: "TEXT",
    getDefaultValue: jest.fn().mockReturnValue(""),
    validateValue: jest.fn().mockReturnValue(null),
    formatValue: jest.fn().mockImplementation((val) => val),
  };

  const mockTypeRegistry = {
    resolveHandlerAndConfig: jest.fn().mockReturnValue({
      handler: mockHandler,
      config: {},
    }),
  } as unknown as jest.Mocked<PropertyTypeRegistry>;

  const mockTemplatePropertyValueRepo = {
    findById: jest.fn(),
    findAllByTemplate: jest.fn(),
    upsert: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  } as unknown as jest.Mocked<TemplatePropertyValueRepository>;

  const mockTemplateRepo = {
    findByIdWithOwner: jest.fn(),
  } as unknown as jest.Mocked<TemplateRepository>;

  const mockPropertyRepo = {
    findById: jest.fn(),
  } as unknown as jest.Mocked<PropertyRepository>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TemplatePropertyValueService,
        { provide: AppLogger, useValue: mockLogger },
        { provide: PropertyTypeRegistry, useValue: mockTypeRegistry },
        { provide: TemplatePropertyValueRepository, useValue: mockTemplatePropertyValueRepo },
        { provide: TemplateRepository, useValue: mockTemplateRepo },
        { provide: PropertyRepository, useValue: mockPropertyRepo },
      ],
    }).compile();

    service = module.get<TemplatePropertyValueService>(TemplatePropertyValueService);
    jest.clearAllMocks();
  });

  describe("create", () => {
    it("TC-TMPL-U-011: should throw NotFoundException when template not found", async () => {
      mockTemplateRepo.findByIdWithOwner.mockResolvedValue(null);

      await expect(service.create({ templateId: "tpl-1", propertyId: "prop-1", value: "test" }, "user-1")).rejects.toThrow(
        NotFoundException,
      );
    });

    it("TC-TMPL-U-012: should throw NotFoundException when property not found", async () => {
      mockTemplateRepo.findByIdWithOwner.mockResolvedValue({ id: "tpl-1", databaseId: "db-1" } as any);
      mockPropertyRepo.findById.mockResolvedValue(null);

      await expect(service.create({ templateId: "tpl-1", propertyId: "prop-1", value: "test" }, "user-1")).rejects.toThrow(
        NotFoundException,
      );
    });

    it("TC-TMPL-U-013: should throw ConflictException when property database mismatch", async () => {
      mockTemplateRepo.findByIdWithOwner.mockResolvedValue({ id: "tpl-1", databaseId: "db-1" } as any);
      mockPropertyRepo.findById.mockResolvedValue({ id: "prop-1", databaseId: "db-2" } as any);

      await expect(service.create({ templateId: "tpl-1", propertyId: "prop-1", value: "test" }, "user-1")).rejects.toThrow(
        ConflictException,
      );
    });

    it("TC-TMPL-U-014: should throw BadRequestException when value is invalid", async () => {
      mockTemplateRepo.findByIdWithOwner.mockResolvedValue({ id: "tpl-1", databaseId: "db-1" } as any);
      mockPropertyRepo.findById.mockResolvedValue({ id: "prop-1", databaseId: "db-1", type: "TEXT" } as any);
      mockHandler.validateValue.mockReturnValue(["value is too long"]);

      await expect(service.create({ templateId: "tpl-1", propertyId: "prop-1", value: "invalid" }, "user-1")).rejects.toThrow(
        BadRequestException,
      );
    });

    it("TC-TMPL-U-015: should create template property value successfully", async () => {
      mockTemplateRepo.findByIdWithOwner.mockResolvedValue({ id: "tpl-1", databaseId: "db-1" } as any);
      mockPropertyRepo.findById.mockResolvedValue({ id: "prop-1", databaseId: "db-1", type: "TEXT" } as any);
      mockHandler.validateValue.mockReturnValue(null);
      mockHandler.formatValue.mockReturnValue("formatted");
      mockTemplatePropertyValueRepo.upsert.mockResolvedValue({
        id: "val-1",
        templateId: "tpl-1",
        propertyId: "prop-1",
        value: "formatted",
      } as any);

      const result = await service.create({ templateId: "tpl-1", propertyId: "prop-1", value: "test" }, "user-1");

      expect(result).toBeDefined();
      expect(result.id).toBe("val-1");
      expect(mockTemplatePropertyValueRepo.upsert).toHaveBeenCalledWith("tpl-1", "prop-1", "formatted");
    });
  });

  describe("findAll", () => {
    it("TC-TMPL-U-016: should return list of template property values", async () => {
      mockTemplatePropertyValueRepo.findAllByTemplate.mockResolvedValue([{ id: "val-1", value: "test" }] as any);

      const result = await service.findAll("tpl-1", "user-1");

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe("val-1");
      expect(mockTemplatePropertyValueRepo.findAllByTemplate).toHaveBeenCalledWith("tpl-1", "user-1");
    });
  });

  describe("findOne", () => {
    it("TC-TMPL-U-017: should throw NotFoundException when value not found", async () => {
      mockTemplatePropertyValueRepo.findById.mockResolvedValue(null);

      await expect(service.findOne("val-nonexistent")).rejects.toThrow(NotFoundException);
    });

    it("TC-TMPL-U-018: should return value when found", async () => {
      mockTemplatePropertyValueRepo.findById.mockResolvedValue({ id: "val-1", value: "test" } as any);

      const result = await service.findOne("val-1");

      expect(result.id).toBe("val-1");
      expect(mockTemplatePropertyValueRepo.findById).toHaveBeenCalledWith("val-1");
    });
  });

  describe("update", () => {
    it("TC-TMPL-U-019: should throw NotFoundException when updating non-existent value", async () => {
      mockTemplatePropertyValueRepo.findById.mockResolvedValue(null);

      await expect(service.update("val-nonexistent", { value: "new" })).rejects.toThrow(NotFoundException);
    });

    it("TC-TMPL-U-020: should throw BadRequestException when updated value is invalid", async () => {
      mockTemplatePropertyValueRepo.findById.mockResolvedValue({
        id: "val-1",
        property: { type: "TEXT" },
      } as any);
      mockHandler.validateValue.mockReturnValue(["invalid format"]);

      await expect(service.update("val-1", { value: "bad" })).rejects.toThrow(BadRequestException);
    });

    it("TC-TMPL-U-021: should update value successfully", async () => {
      mockTemplatePropertyValueRepo.findById.mockResolvedValue({
        id: "val-1",
        property: { type: "TEXT" },
      } as any);
      mockHandler.validateValue.mockReturnValue(null);
      mockHandler.formatValue.mockReturnValue("formatted-new");
      mockTemplatePropertyValueRepo.update.mockResolvedValue({
        id: "val-1",
        value: "formatted-new",
      } as any);

      const result = await service.update("val-1", { value: "new" });

      expect(result.value).toBe("formatted-new");
      expect(mockTemplatePropertyValueRepo.update).toHaveBeenCalledWith("val-1", {
        value: "formatted-new",
      });
    });
  });

  describe("remove", () => {
    it("TC-TMPL-U-022: should throw NotFoundException when deleting non-existent value", async () => {
      mockTemplatePropertyValueRepo.findById.mockResolvedValue(null);

      await expect(service.remove("val-nonexistent")).rejects.toThrow(NotFoundException);
    });

    it("TC-TMPL-U-023: should remove value successfully", async () => {
      mockTemplatePropertyValueRepo.findById.mockResolvedValue({ id: "val-1" } as any);
      mockTemplatePropertyValueRepo.delete.mockResolvedValue({ id: "val-1" } as any);

      const result = await service.remove("val-1");

      expect(result.id).toBe("val-1");
      expect(mockTemplatePropertyValueRepo.delete).toHaveBeenCalledWith("val-1");
    });
  });
});
