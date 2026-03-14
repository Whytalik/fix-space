import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { NotFoundException } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";

jest.mock("@nucleus/database", () => ({
  prisma: {
    database: {
      findFirst: jest.fn<any>(),
    },
    property: {
      findMany: jest.fn<any>(),
    },
    template: {
      findFirst: jest.fn<any>(),
      findMany: jest.fn<any>(),
      findUniqueOrThrow: jest.fn<any>(),
      update: jest.fn<any>(),
      updateMany: jest.fn<any>(),
      delete: jest.fn<any>(),
    },
    $transaction: jest.fn<any>(),
  },
}));

import { Prisma, prisma } from "@nucleus/database";
import { CreateTemplateDto } from "@nucleus/domain";
import { AppLogger } from "../../common/logger/app-logger.service";
import { TemplateService } from "../template.service";

const mockLogger = {
  setContext: jest.fn<any>(),
  debug: jest.fn<any>(),
  log: jest.fn<any>(),
  warn: jest.fn<any>(),
  error: jest.fn<any>(),
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

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [TemplateService, { provide: AppLogger, useValue: mockLogger }],
    }).compile();

    service = module.get<TemplateService>(TemplateService);
  });

  describe("create", () => {
    it("should create a template with property values", async () => {
      const dto: CreateTemplateDto = { databaseId: "db-1", name: "My Template" };

      (prisma.database.findFirst as jest.Mock<any>).mockResolvedValue(mockDatabase);
      (prisma.property.findMany as jest.Mock<any>).mockResolvedValue([mockProperty]);

      const mockTxTemplate = { create: jest.fn<any>(), updateMany: jest.fn<any>(), findUniqueOrThrow: jest.fn<any>() };
      const mockTxTemplatePropertyValue = { create: jest.fn<any>() };
      const mockTx = {
        template: mockTxTemplate,
        templatePropertyValue: mockTxTemplatePropertyValue,
      } as unknown as Prisma.TransactionClient;

      mockTxTemplate.updateMany.mockResolvedValue({ count: 0 });
      mockTxTemplate.create.mockResolvedValue(mockTemplate);
      mockTxTemplatePropertyValue.create.mockResolvedValue({});
      mockTxTemplate.findUniqueOrThrow.mockResolvedValue(mockTemplate);

      (prisma.$transaction as jest.Mock<any>).mockImplementation(
        async (cb: (tx: Prisma.TransactionClient) => Promise<unknown>) => cb(mockTx),
      );

      const result = await service.create("db-1", dto, "user-1");

      expect(result.id).toBe("tmpl-1");
      expect(mockTxTemplate.create).toHaveBeenCalled();
      expect(mockTxTemplatePropertyValue.create).toHaveBeenCalledWith({
        data: { templateId: "tmpl-1", propertyId: "prop-1", value: null },
      });
    });

    it("should throw NotFoundException when database not found", async () => {
      (prisma.database.findFirst as jest.Mock<any>).mockResolvedValue(null);

      await expect(
        service.create("nonexistent", { databaseId: "nonexistent" }, "user-1"),
      ).rejects.toThrow(NotFoundException);
    });

    it("should clear existing defaults when isDefault is true", async () => {
      const dto: CreateTemplateDto = { databaseId: "db-1", isDefault: true };

      (prisma.database.findFirst as jest.Mock<any>).mockResolvedValue(mockDatabase);
      (prisma.property.findMany as jest.Mock<any>).mockResolvedValue([]);

      const mockTxTemplate = { create: jest.fn<any>(), updateMany: jest.fn<any>(), findUniqueOrThrow: jest.fn<any>() };
      const mockTx = {
        template: mockTxTemplate,
        templatePropertyValue: { create: jest.fn<any>() },
      } as unknown as Prisma.TransactionClient;

      mockTxTemplate.updateMany.mockResolvedValue({ count: 1 });
      mockTxTemplate.create.mockResolvedValue({ ...mockTemplate, isDefault: true });
      mockTxTemplate.findUniqueOrThrow.mockResolvedValue({ ...mockTemplate, isDefault: true });

      (prisma.$transaction as jest.Mock<any>).mockImplementation(
        async (cb: (tx: Prisma.TransactionClient) => Promise<unknown>) => cb(mockTx),
      );

      await service.create("db-1", dto, "user-1");

      expect(mockTxTemplate.updateMany).toHaveBeenCalledWith({
        where: { databaseId: "db-1", isDefault: true },
        data: { isDefault: false },
      });
    });
  });

  describe("findAll", () => {
    it("should return all templates for a database", async () => {
      (prisma.template.findMany as jest.Mock<any>).mockResolvedValue([mockTemplate]);

      const result = await service.findAll("db-1", "user-1");

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe("tmpl-1");
    });
  });

  describe("findOne", () => {
    it("should return a single template", async () => {
      (prisma.template.findFirst as jest.Mock<any>).mockResolvedValue(mockTemplate);

      const result = await service.findOne("tmpl-1", "user-1");

      expect(result.id).toBe("tmpl-1");
    });

    it("should throw NotFoundException when template not found", async () => {
      (prisma.template.findFirst as jest.Mock<any>).mockResolvedValue(null);

      await expect(service.findOne("nonexistent", "user-1")).rejects.toThrow(NotFoundException);
    });
  });

  describe("update", () => {
    it("should update template metadata", async () => {
      const updatedTemplate = { ...mockTemplate, name: "Updated" };
      (prisma.template.findFirst as jest.Mock<any>).mockResolvedValue(mockTemplate);

      const mockTxTemplate = { update: jest.fn<any>(), updateMany: jest.fn<any>() };
      const mockTx = { template: mockTxTemplate } as unknown as Prisma.TransactionClient;

      mockTxTemplate.updateMany.mockResolvedValue({ count: 0 });
      mockTxTemplate.update.mockResolvedValue(updatedTemplate);

      (prisma.$transaction as jest.Mock<any>).mockImplementation(
        async (cb: (tx: Prisma.TransactionClient) => Promise<unknown>) => cb(mockTx),
      );

      const result = await service.update("tmpl-1", { name: "Updated" }, "user-1");

      expect(result.name).toBe("Updated");
      expect(mockTxTemplate.update).toHaveBeenCalled();
    });

    it("should clear existing defaults when isDefault is true", async () => {
      (prisma.template.findFirst as jest.Mock<any>).mockResolvedValue(mockTemplate);

      const mockTxTemplate = { update: jest.fn<any>(), updateMany: jest.fn<any>() };
      const mockTx = { template: mockTxTemplate } as unknown as Prisma.TransactionClient;

      mockTxTemplate.updateMany.mockResolvedValue({ count: 1 });
      mockTxTemplate.update.mockResolvedValue({ ...mockTemplate, isDefault: true });

      (prisma.$transaction as jest.Mock<any>).mockImplementation(
        async (cb: (tx: Prisma.TransactionClient) => Promise<unknown>) => cb(mockTx),
      );

      await service.update("tmpl-1", { isDefault: true }, "user-1");

      expect(mockTxTemplate.updateMany).toHaveBeenCalledWith({
        where: { databaseId: "db-1", isDefault: true },
        data: { isDefault: false },
      });
    });

    it("should throw NotFoundException when template not found", async () => {
      (prisma.template.findFirst as jest.Mock<any>).mockResolvedValue(null);

      await expect(service.update("nonexistent", { name: "X" }, "user-1")).rejects.toThrow(NotFoundException);
    });
  });

  describe("remove", () => {
    it("should delete a template", async () => {
      (prisma.template.findFirst as jest.Mock<any>).mockResolvedValue(mockTemplate);
      (prisma.template.delete as jest.Mock<any>).mockResolvedValue(mockTemplate);

      const result = await service.remove("tmpl-1", "user-1");

      expect(result.id).toBe("tmpl-1");
    });

    it("should throw NotFoundException when template not found", async () => {
      (prisma.template.findFirst as jest.Mock<any>).mockResolvedValue(null);

      await expect(service.remove("nonexistent", "user-1")).rejects.toThrow(NotFoundException);
    });

    it("should rethrow unknown errors", async () => {
      (prisma.template.findFirst as jest.Mock<any>).mockResolvedValue(mockTemplate);
      (prisma.template.delete as jest.Mock<any>).mockRejectedValue(new Error("DB error"));

      await expect(service.remove("tmpl-1", "user-1")).rejects.toThrow("DB error");
    });
  });
});
