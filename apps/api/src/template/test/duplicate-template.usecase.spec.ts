import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { NotFoundException } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";

jest.mock("@nucleus/database", () => ({
  prisma: {
    template: {
      findFirst: jest.fn<any>(),
    },
    $transaction: jest.fn<any>(),
  },
}));

import { prisma } from "@nucleus/database";
import { AppLogger } from "../../common/logger/app-logger.service";
import { DuplicateTemplateUseCase } from "../providers/duplicate-template.usecase";

const mockLogger = {
  setContext: jest.fn<any>(),
  log: jest.fn<any>(),
  debug: jest.fn<any>(),
  warn: jest.fn<any>(),
  error: jest.fn<any>(),
};

const mockSourceTemplate = {
  id: "tmpl-1",
  databaseId: "db-1",
  name: "My Template",
  description: null,
  icon: null,
  isDefault: false,
  position: 0,
  createdAt: new Date(),
  updatedAt: new Date(),
  values: [
    { id: "tpv-1", templateId: "tmpl-1", propertyId: "prop-1", value: "hello" },
  ],
};

describe("DuplicateTemplateUseCase", () => {
  let useCase: DuplicateTemplateUseCase;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [DuplicateTemplateUseCase, { provide: AppLogger, useValue: mockLogger }],
    }).compile();

    useCase = module.get<DuplicateTemplateUseCase>(DuplicateTemplateUseCase);
  });

  describe("execute", () => {
    it("should throw NotFoundException when template is not found", async () => {
      (prisma.template.findFirst as jest.Mock<any>).mockResolvedValue(null);

      await expect(useCase.execute("tmpl-missing", "user-1")).rejects.toThrow(NotFoundException);
      await expect(useCase.execute("tmpl-missing", "user-1")).rejects.toThrow("Template with id tmpl-missing not found");
    });

    it("should create a copy with name '{source.name} Copy' and copy all property values", async () => {
      (prisma.template.findFirst as jest.Mock<any>).mockResolvedValue(mockSourceTemplate);

      const newTemplate = {
        ...mockSourceTemplate,
        id: "tmpl-copy",
        name: "My Template Copy",
        values: [{ id: "tpv-copy", templateId: "tmpl-copy", propertyId: "prop-1", value: "hello" }],
      };

      const mockTx = {
        template: {
          create: jest.fn<any>().mockResolvedValue({ ...newTemplate, values: undefined }),
          findUniqueOrThrow: jest.fn<any>().mockResolvedValue(newTemplate),
        },
        templatePropertyValue: {
          create: jest.fn<any>().mockResolvedValue(newTemplate.values[0]),
        },
      };

      (prisma.$transaction as jest.Mock<any>).mockImplementation(
        async (cb: (tx: typeof mockTx) => Promise<unknown>) => cb(mockTx),
      );

      const result = await useCase.execute("tmpl-1", "user-1");

      expect(mockTx.template.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            databaseId: "db-1",
            name: "My Template Copy",
            isDefault: false,
          }),
        }),
      );
      expect(mockTx.templatePropertyValue.create).toHaveBeenCalledTimes(1);
      expect(mockTx.templatePropertyValue.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            propertyId: "prop-1",
            value: "hello",
          }),
        }),
      );
      expect(result).toMatchObject({ name: "My Template Copy" });
    });

    it("should skip templatePropertyValue.create when values array is empty", async () => {
      const sourceNoValues = { ...mockSourceTemplate, values: [] };
      (prisma.template.findFirst as jest.Mock<any>).mockResolvedValue(sourceNoValues);

      const newTemplate = { ...sourceNoValues, id: "tmpl-copy", name: "My Template Copy" };

      const mockTx = {
        template: {
          create: jest.fn<any>().mockResolvedValue(newTemplate),
          findUniqueOrThrow: jest.fn<any>().mockResolvedValue(newTemplate),
        },
        templatePropertyValue: {
          create: jest.fn<any>(),
        },
      };

      (prisma.$transaction as jest.Mock<any>).mockImplementation(
        async (cb: (tx: typeof mockTx) => Promise<unknown>) => cb(mockTx),
      );

      await useCase.execute("tmpl-1", "user-1");

      expect(mockTx.templatePropertyValue.create).not.toHaveBeenCalled();
    });

    it("should rethrow unknown errors", async () => {
      (prisma.template.findFirst as jest.Mock<any>).mockRejectedValue(new Error("DB error"));

      await expect(useCase.execute("tmpl-1", "user-1")).rejects.toThrow("DB error");
    });
  });
});
