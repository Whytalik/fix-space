import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { BadRequestException, ConflictException, NotFoundException } from "@nestjs/common";
import type { TestingModule } from "@nestjs/testing";
import { Test } from "@nestjs/testing";
import type { CreateTemplatePropertyValueDto } from "@nucleus/domain";
import { AppLogger } from "../../common/logger/app-logger.service";
import { PropertyTypeRegistry } from "../../property/types";
import { TemplatePropertyValueRepository } from "../template-property-value.repository";
import { TemplatePropertyValueService } from "../template-property-value.service";

const mockLogger = {
  setContext: jest.fn<any>(),
  debug: jest.fn<any>(),
  log: jest.fn<any>(),
  warn: jest.fn<any>(),
  error: jest.fn<any>(),
};

const mockHandler = {
  getDefaultValue: jest.fn<any>().mockReturnValue(null),
  validateValue: jest.fn<any>().mockReturnValue(null),
  formatValue: jest.fn<any>().mockImplementation((v: unknown) => v),
};

const mockConfigHandler = {
  getDefaultConfig: jest.fn<any>().mockReturnValue({}),
};

const mockTypeRegistry = {
  getValueHandler: jest.fn<any>().mockReturnValue(mockHandler),
  getConfigHandler: jest.fn<any>().mockReturnValue(mockConfigHandler),
};

const mockTpvRepo = {
  findTemplateByOwner: jest.fn<any>(),
  findPropertyById: jest.fn<any>(),
  findByIdWithOwner: jest.fn<any>(),
  findAllByTemplate: jest.fn<any>(),
  upsert: jest.fn<any>(),
  update: jest.fn<any>(),
  delete: jest.fn<any>(),
};

const mockTemplate = { id: "tmpl-1", databaseId: "db-1" };
const mockProperty = { id: "prop-1", databaseId: "db-1", type: "TEXT", config: null };
const mockValue = { id: "val-1", templateId: "tmpl-1", propertyId: "prop-1", value: null };

describe("TemplatePropertyValueService", () => {
  let service: TemplatePropertyValueService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TemplatePropertyValueService,
        { provide: AppLogger, useValue: mockLogger },
        { provide: PropertyTypeRegistry, useValue: mockTypeRegistry },
        { provide: TemplatePropertyValueRepository, useValue: mockTpvRepo },
      ],
    }).compile();

    service = module.get<TemplatePropertyValueService>(TemplatePropertyValueService);
  });

  describe("create", () => {
    it("should upsert a template property value", async () => {
      const dto: CreateTemplatePropertyValueDto = { templateId: "tmpl-1", propertyId: "prop-1", value: "test" };

      mockTpvRepo.findTemplateByOwner.mockResolvedValue(mockTemplate);
      mockTpvRepo.findPropertyById.mockResolvedValue(mockProperty);
      mockTpvRepo.upsert.mockResolvedValue(mockValue);

      const result = await service.create(dto, "user-1");

      expect(result.id).toBe("val-1");
      expect(mockTpvRepo.upsert).toHaveBeenCalledWith("tmpl-1", "prop-1", expect.anything());
    });

    it("should throw NotFoundException when template not found", async () => {
      mockTpvRepo.findTemplateByOwner.mockResolvedValue(null);

      await expect(service.create({ templateId: "tmpl-1", propertyId: "prop-1" }, "user-1")).rejects.toThrow(
        NotFoundException,
      );
    });

    it("should throw NotFoundException when property not found", async () => {
      mockTpvRepo.findTemplateByOwner.mockResolvedValue(mockTemplate);
      mockTpvRepo.findPropertyById.mockResolvedValue(null);

      await expect(service.create({ templateId: "tmpl-1", propertyId: "prop-1" }, "user-1")).rejects.toThrow(
        NotFoundException,
      );
    });

    it("should throw ConflictException when property belongs to a different database", async () => {
      mockTpvRepo.findTemplateByOwner.mockResolvedValue(mockTemplate);
      mockTpvRepo.findPropertyById.mockResolvedValue({ ...mockProperty, databaseId: "db-other" });

      await expect(service.create({ templateId: "tmpl-1", propertyId: "prop-1" }, "user-1")).rejects.toThrow(
        ConflictException,
      );
    });

    it("should throw BadRequestException for invalid value", async () => {
      mockTpvRepo.findTemplateByOwner.mockResolvedValue(mockTemplate);
      mockTpvRepo.findPropertyById.mockResolvedValue(mockProperty);
      mockHandler.validateValue.mockReturnValueOnce(["Value is invalid"]);

      await expect(
        service.create({ templateId: "tmpl-1", propertyId: "prop-1", value: 999 }, "user-1"),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe("findAll", () => {
    it("should return all template property values", async () => {
      mockTpvRepo.findAllByTemplate.mockResolvedValue([mockValue]);

      const result = await service.findAll("tmpl-1", "user-1");

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe("val-1");
      expect(mockTpvRepo.findAllByTemplate).toHaveBeenCalledWith("tmpl-1", "user-1");
    });
  });

  describe("findOne", () => {
    it("should return a single template property value", async () => {
      mockTpvRepo.findByIdWithOwner.mockResolvedValue({ ...mockValue, property: mockProperty });

      const result = await service.findOne("val-1", "user-1");

      expect(result.id).toBe("val-1");
    });

    it("should throw NotFoundException when not found", async () => {
      mockTpvRepo.findByIdWithOwner.mockResolvedValue(null);

      await expect(service.findOne("nonexistent", "user-1")).rejects.toThrow(NotFoundException);
    });
  });

  describe("update", () => {
    it("should update a template property value", async () => {
      mockTpvRepo.findByIdWithOwner.mockResolvedValue({ ...mockValue, property: mockProperty });
      mockTpvRepo.update.mockResolvedValue({ ...mockValue, value: "updated" });

      const result = await service.update("val-1", { value: "updated" }, "user-1");

      expect(result.id).toBe("val-1");
      expect(mockTpvRepo.update).toHaveBeenCalledWith("val-1", expect.objectContaining({ value: "updated" }));
    });

    it("should throw NotFoundException when not found", async () => {
      mockTpvRepo.findByIdWithOwner.mockResolvedValue(null);

      await expect(service.update("nonexistent", { value: "x" }, "user-1")).rejects.toThrow(NotFoundException);
    });
  });

  describe("remove", () => {
    it("should delete a template property value", async () => {
      mockTpvRepo.findByIdWithOwner.mockResolvedValue(mockValue);
      mockTpvRepo.delete.mockResolvedValue(mockValue);

      const result = await service.remove("val-1", "user-1");

      expect(result.id).toBe("val-1");
      expect(mockTpvRepo.delete).toHaveBeenCalledWith("val-1");
    });

    it("should throw NotFoundException when not found", async () => {
      mockTpvRepo.findByIdWithOwner.mockResolvedValue(null);

      await expect(service.remove("nonexistent", "user-1")).rejects.toThrow(NotFoundException);
    });

    it("should rethrow unknown errors", async () => {
      mockTpvRepo.findByIdWithOwner.mockResolvedValue(mockValue);
      mockTpvRepo.delete.mockRejectedValue(new Error("DB error"));

      await expect(service.remove("val-1", "user-1")).rejects.toThrow("DB error");
    });
  });
});
