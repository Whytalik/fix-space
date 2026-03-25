import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { NotFoundException } from "@nestjs/common";
import type { TestingModule } from "@nestjs/testing";
import { Test } from "@nestjs/testing";
import { AppLogger } from "../../common/logger/app-logger.service";
import { TemplateRepository } from "../template.repository";
import { DuplicateTemplateUseCase } from "../providers/duplicate-template.usecase";

const mockLogger = {
  setContext: jest.fn<any>(),
  log: jest.fn<any>(),
  debug: jest.fn<any>(),
  warn: jest.fn<any>(),
  error: jest.fn<any>(),
};

const mockTemplateRepo = {
  findByIdWithValues: jest.fn<any>(),
  create: jest.fn<any>(),
  findUniqueOrThrowWithValues: jest.fn<any>(),
  transaction: jest.fn<any>(),
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
  values: [{ id: "tpv-1", templateId: "tmpl-1", propertyId: "prop-1", value: "hello" }],
};

describe("DuplicateTemplateUseCase", () => {
  let useCase: DuplicateTemplateUseCase;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DuplicateTemplateUseCase,
        { provide: AppLogger, useValue: mockLogger },
        { provide: TemplateRepository, useValue: mockTemplateRepo },
      ],
    }).compile();

    useCase = module.get<DuplicateTemplateUseCase>(DuplicateTemplateUseCase);
  });

  describe("execute", () => {
    it("should throw NotFoundException when template is not found", async () => {
      mockTemplateRepo.findByIdWithValues.mockResolvedValue(null);

      await expect(useCase.execute("tmpl-missing", "user-1")).rejects.toThrow(NotFoundException);
      await expect(useCase.execute("tmpl-missing", "user-1")).rejects.toThrow(
        "Template with id tmpl-missing not found",
      );
    });

    it("should create a copy with name '{source.name} Copy' and copy all property values", async () => {
      mockTemplateRepo.findByIdWithValues.mockResolvedValue(mockSourceTemplate);

      const newTemplate = {
        ...mockSourceTemplate,
        id: "tmpl-copy",
        name: "My Template Copy",
        values: [{ id: "tpv-copy", templateId: "tmpl-copy", propertyId: "prop-1", value: "hello" }],
      };

      const fakeTx = {
        templatePropertyValue: {
          create: jest.fn<any>().mockResolvedValue(newTemplate.values[0]),
        },
      };

      mockTemplateRepo.create.mockResolvedValue({ ...newTemplate, values: undefined });
      mockTemplateRepo.findUniqueOrThrowWithValues.mockResolvedValue(newTemplate);
      mockTemplateRepo.transaction.mockImplementation(async (cb: (tx: typeof fakeTx) => Promise<unknown>) => cb(fakeTx));

      const result = await useCase.execute("tmpl-1", "user-1");

      expect(mockTemplateRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          databaseId: "db-1",
          name: "My Template Copy",
          isDefault: false,
        }),
        fakeTx,
      );
      expect(fakeTx.templatePropertyValue.create).toHaveBeenCalledTimes(1);
      expect(fakeTx.templatePropertyValue.create).toHaveBeenCalledWith(
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
      mockTemplateRepo.findByIdWithValues.mockResolvedValue(sourceNoValues);

      const newTemplate = { ...sourceNoValues, id: "tmpl-copy", name: "My Template Copy" };

      const fakeTx = {
        templatePropertyValue: {
          create: jest.fn<any>(),
        },
      };

      mockTemplateRepo.create.mockResolvedValue(newTemplate);
      mockTemplateRepo.findUniqueOrThrowWithValues.mockResolvedValue(newTemplate);
      mockTemplateRepo.transaction.mockImplementation(async (cb: (tx: typeof fakeTx) => Promise<unknown>) => cb(fakeTx));

      await useCase.execute("tmpl-1", "user-1");

      expect(fakeTx.templatePropertyValue.create).not.toHaveBeenCalled();
    });

    it("should rethrow unknown errors", async () => {
      mockTemplateRepo.findByIdWithValues.mockRejectedValue(new Error("DB error"));

      await expect(useCase.execute("tmpl-1", "user-1")).rejects.toThrow("DB error");
    });
  });
});
