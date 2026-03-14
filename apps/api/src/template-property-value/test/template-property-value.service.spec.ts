import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { BadRequestException, ConflictException, NotFoundException } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";

jest.mock("@nucleus/database", () => ({
  prisma: {
    template: {
      findFirst: jest.fn<any>(),
    },
    property: {
      findUnique: jest.fn<any>(),
    },
    templatePropertyValue: {
      findFirst: jest.fn<any>(),
      findMany: jest.fn<any>(),
      upsert: jest.fn<any>(),
      update: jest.fn<any>(),
      delete: jest.fn<any>(),
    },
  },
}));

import { prisma } from "@nucleus/database";
import { CreateTemplatePropertyValueDto } from "@nucleus/domain";
import { AppLogger } from "../../common/logger/app-logger.service";
import { PropertyTypeRegistry } from "../../property/types";
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
      ],
    }).compile();

    service = module.get<TemplatePropertyValueService>(TemplatePropertyValueService);
  });

  describe("create", () => {
    it("should upsert a template property value", async () => {
      const dto: CreateTemplatePropertyValueDto = { templateId: "tmpl-1", propertyId: "prop-1", value: "test" };

      (prisma.template.findFirst as jest.Mock<any>).mockResolvedValue(mockTemplate);
      (prisma.property.findUnique as jest.Mock<any>).mockResolvedValue(mockProperty);
      (prisma.templatePropertyValue.upsert as jest.Mock<any>).mockResolvedValue(mockValue);

      const result = await service.create(dto, "user-1");

      expect(result.id).toBe("val-1");
      expect(prisma.templatePropertyValue.upsert).toHaveBeenCalled();
    });

    it("should throw NotFoundException when template not found", async () => {
      (prisma.template.findFirst as jest.Mock<any>).mockResolvedValue(null);

      await expect(
        service.create({ templateId: "tmpl-1", propertyId: "prop-1" }, "user-1"),
      ).rejects.toThrow(NotFoundException);
    });

    it("should throw NotFoundException when property not found", async () => {
      (prisma.template.findFirst as jest.Mock<any>).mockResolvedValue(mockTemplate);
      (prisma.property.findUnique as jest.Mock<any>).mockResolvedValue(null);

      await expect(
        service.create({ templateId: "tmpl-1", propertyId: "prop-1" }, "user-1"),
      ).rejects.toThrow(NotFoundException);
    });

    it("should throw ConflictException when property belongs to a different database", async () => {
      (prisma.template.findFirst as jest.Mock<any>).mockResolvedValue(mockTemplate);
      (prisma.property.findUnique as jest.Mock<any>).mockResolvedValue({ ...mockProperty, databaseId: "db-other" });

      await expect(
        service.create({ templateId: "tmpl-1", propertyId: "prop-1" }, "user-1"),
      ).rejects.toThrow(ConflictException);
    });

    it("should throw BadRequestException for invalid value", async () => {
      (prisma.template.findFirst as jest.Mock<any>).mockResolvedValue(mockTemplate);
      (prisma.property.findUnique as jest.Mock<any>).mockResolvedValue(mockProperty);
      mockHandler.validateValue.mockReturnValueOnce(["Value is invalid"]);

      await expect(
        service.create({ templateId: "tmpl-1", propertyId: "prop-1", value: 999 }, "user-1"),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe("findAll", () => {
    it("should return all template property values", async () => {
      (prisma.templatePropertyValue.findMany as jest.Mock<any>).mockResolvedValue([mockValue]);

      const result = await service.findAll("tmpl-1", "user-1");

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe("val-1");
    });
  });

  describe("findOne", () => {
    it("should return a single template property value", async () => {
      (prisma.templatePropertyValue.findFirst as jest.Mock<any>).mockResolvedValue({
        ...mockValue,
        property: mockProperty,
      });

      const result = await service.findOne("val-1", "user-1");

      expect(result.id).toBe("val-1");
    });

    it("should throw NotFoundException when not found", async () => {
      (prisma.templatePropertyValue.findFirst as jest.Mock<any>).mockResolvedValue(null);

      await expect(service.findOne("nonexistent", "user-1")).rejects.toThrow(NotFoundException);
    });
  });

  describe("update", () => {
    it("should update a template property value", async () => {
      (prisma.templatePropertyValue.findFirst as jest.Mock<any>).mockResolvedValue({
        ...mockValue,
        property: mockProperty,
      });
      (prisma.templatePropertyValue.update as jest.Mock<any>).mockResolvedValue({ ...mockValue, value: "updated" });

      const result = await service.update("val-1", { value: "updated" }, "user-1");

      expect(result.id).toBe("val-1");
    });

    it("should throw NotFoundException when not found", async () => {
      (prisma.templatePropertyValue.findFirst as jest.Mock<any>).mockResolvedValue(null);

      await expect(service.update("nonexistent", { value: "x" }, "user-1")).rejects.toThrow(NotFoundException);
    });
  });

  describe("remove", () => {
    it("should delete a template property value", async () => {
      (prisma.templatePropertyValue.findFirst as jest.Mock<any>).mockResolvedValue(mockValue);
      (prisma.templatePropertyValue.delete as jest.Mock<any>).mockResolvedValue(mockValue);

      const result = await service.remove("val-1", "user-1");

      expect(result.id).toBe("val-1");
    });

    it("should throw NotFoundException when not found", async () => {
      (prisma.templatePropertyValue.findFirst as jest.Mock<any>).mockResolvedValue(null);

      await expect(service.remove("nonexistent", "user-1")).rejects.toThrow(NotFoundException);
    });

    it("should rethrow unknown errors", async () => {
      (prisma.templatePropertyValue.findFirst as jest.Mock<any>).mockResolvedValue(mockValue);
      (prisma.templatePropertyValue.delete as jest.Mock<any>).mockRejectedValue(new Error("DB error"));

      await expect(service.remove("val-1", "user-1")).rejects.toThrow("DB error");
    });
  });
});
