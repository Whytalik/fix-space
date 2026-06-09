import { NotFoundException } from "@nestjs/common";
import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import type { TestingModule } from "@nestjs/testing";
import { Test } from "@nestjs/testing";
import { AppLogger } from "@/common/logger/app-logger.service";
import { DuplicateTemplateUseCase } from "../providers/duplicate-template.usecase";
import { TemplateRepository } from "../repositories/template.repository";

jest.mock("@fixspace/database", () => ({
  Prisma: {
    InputJsonValue: undefined,
  },
  prisma: {
    template: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    templatePropertyValue: { create: jest.fn() },
    $transaction: jest.fn((callback: (tx: unknown) => unknown) => callback(prisma)),
  },
}));

import { prisma } from "@fixspace/database";

describe("DuplicateTemplateUseCase", () => {
  let useCase: DuplicateTemplateUseCase;
  let templateRepo: jest.Mocked<TemplateRepository>;

  const mockLogger: jest.Mocked<AppLogger> = {
    setContext: jest.fn(),
    debug: jest.fn(),
    log: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  } as unknown as jest.Mocked<AppLogger>;

  const mockTemplateRepo = {
    findByIdWithValues: jest.fn(),
    create: jest.fn(),
    findUniqueOrThrowWithValues: jest.fn(),
    transaction: jest.fn((callback) => callback(prisma)),
    findUniqueTemplateName: jest.fn((name: string) => Promise.resolve(`${name} (copy)`)),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DuplicateTemplateUseCase,
        { provide: TemplateRepository, useValue: mockTemplateRepo },
        { provide: AppLogger, useValue: mockLogger },
      ],
    }).compile();

    useCase = module.get<DuplicateTemplateUseCase>(DuplicateTemplateUseCase);
    templateRepo = module.get(TemplateRepository);

    jest.clearAllMocks();
  });

  describe("execute", () => {
    it("should throw NotFoundException when source template not found", async () => {
      mockTemplateRepo.findByIdWithValues.mockResolvedValue(null);

      await expect(useCase.execute("nonexistent")).rejects.toThrow(NotFoundException);
    });

    it("should duplicate template with property values", async () => {
      const sourceTemplate = {
        id: "tpl-1",
        name: "Original Template",
        description: "Test description",
        icon: "📋",
        databaseId: "db-1",
        isDefault: false,
        position: 0,
        values: [
          {
            id: "tpl-val-1",
            templateId: "tpl-1",
            propertyId: "prop-1",
            value: "Test Value",
          },
        ],
      };

      mockTemplateRepo.findByIdWithValues.mockResolvedValue(sourceTemplate);

      const newTemplate = {
        id: "tpl-2",
        name: "Original Template (copy)",
        description: "Test description",
        icon: "📋",
        databaseId: "db-1",
        isDefault: false,
        position: 0,
        values: [],
      };

      mockTemplateRepo.create.mockResolvedValue({
        id: "tpl-2",
        name: "Original Template (copy)",
        description: "Test description",
        icon: "📋",
        databaseId: "db-1",
        isDefault: false,
        position: 0,
      });
      (prisma.templatePropertyValue.create as jest.Mock<any>).mockResolvedValue({ id: "tpl-val-2" });
      mockTemplateRepo.findUniqueOrThrowWithValues.mockResolvedValue(newTemplate);

      const result = await useCase.execute("tpl-1");

      expect(result).toBeDefined();
      expect(templateRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          databaseId: "db-1",
          name: expect.stringContaining("Original Template"),
          isDefault: false,
        }),
        prisma,
      );
      expect(prisma.templatePropertyValue.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          templateId: "tpl-2",
          propertyId: "prop-1",
          value: "Test Value",
        }),
      });
    });

    it("should set isDefault to false for duplicated template", async () => {
      const sourceTemplate = {
        id: "tpl-1",
        name: "Default Template",
        description: null,
        icon: null,
        databaseId: "db-1",
        isDefault: true,
        position: 0,
        values: [],
      };

      mockTemplateRepo.findByIdWithValues.mockResolvedValue(sourceTemplate);
      mockTemplateRepo.create.mockResolvedValue({
        id: "tpl-2",
        name: "Default Template (copy)",
        description: null,
        icon: null,
        databaseId: "db-1",
        isDefault: false,
        position: 0,
      });
      mockTemplateRepo.findUniqueOrThrowWithValues.mockResolvedValue({
        id: "tpl-2",
        name: "Default Template (copy)",
        databaseId: "db-1",
        isDefault: false,
        values: [],
      });

      await useCase.execute("tpl-1");

      expect(templateRepo.create).toHaveBeenCalledWith(expect.objectContaining({ isDefault: false }), prisma);
    });
  });
});
