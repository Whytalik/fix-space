import { BadRequestException, NotFoundException } from "@nestjs/common";
import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import type { TestingModule } from "@nestjs/testing";
import { Test } from "@nestjs/testing";
import { AppLogger } from "@/common/logger/app-logger.service";
import { SpaceRepository } from "../repositories/space.repository";
import { DuplicateSpaceUseCase } from "../providers/duplicate-space.usecase";

jest.mock("@fixspace/database", () => ({
  Prisma: {
    InputJsonValue: undefined,
  },
  prisma: {
    space: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    section: { create: jest.fn() },
    database: { create: jest.fn() },
    property: { create: jest.fn() },
    template: { create: jest.fn() },
    record: { create: jest.fn() },
    propertyValue: { create: jest.fn() },
    templatePropertyValue: { create: jest.fn() },
    $transaction: jest.fn((callback: (tx: unknown) => unknown) => callback(prisma)),
  },
}));

import { prisma } from "@fixspace/database";

describe("DuplicateSpaceUseCase", () => {
  let useCase: DuplicateSpaceUseCase;

  const mockLogger: jest.Mocked<AppLogger> = {
    setContext: jest.fn(),
    debug: jest.fn(),
    log: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  } as unknown as jest.Mocked<AppLogger>;

  const mockSpaceRepo = {
    findByIdForDuplicate: jest.fn(),
    transaction: jest.fn((callback) => callback(prisma)),
    findUniqueSpaceName: jest.fn((name: string) => Promise.resolve(`${name} (copy)`)),
    count: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DuplicateSpaceUseCase,
        { provide: SpaceRepository, useValue: mockSpaceRepo },
        { provide: AppLogger, useValue: mockLogger },
      ],
    }).compile();

    useCase = module.get<DuplicateSpaceUseCase>(DuplicateSpaceUseCase);

    jest.clearAllMocks();
    mockSpaceRepo.count.mockResolvedValue(0);
  });

  describe("execute", () => {
    it("TC-WS-U-017: should throw NotFoundException when source space not found", async () => {
      mockSpaceRepo.findByIdForDuplicate.mockResolvedValue(null);

      await expect(useCase.execute("nonexistent", "user-1")).rejects.toThrow(NotFoundException);
    });

    it("TC-WS-U-018: should duplicate space with sections, databases, properties, templates, and records", async () => {
      const sourceSpace = {
        id: "space-1",
        name: "Original Space",
        icon: "🚀",
        ownerId: "user-1",
        config: null,
        sections: [{ id: "sec-1", name: "Trading", position: 0, icon: "📊", color: "#3b82f6", spaceId: "space-1" }],
        databases: [
          {
            id: "db-1",
            name: "Journal",
            title: "Trading Journal",
            icon: "📓",
            spaceId: "space-1",
            sectionId: "sec-1",
            properties: [
              {
                id: "prop-1",
                name: "Pair",
                type: "select",
                position: 0,
                icon: null,
                isVisible: true,
                databaseId: "db-1",
                config: { options: [] },
              },
            ],
            templates: [
              {
                id: "tpl-1",
                name: "Default Template",
                description: null,
                icon: null,
                namePattern: null,
                content: {},
                isDefault: false,
                position: 0,
                config: null,
                databaseId: "db-1",
                values: [
                  {
                    id: "tpl-val-1",
                    templateId: "tpl-1",
                    propertyId: "prop-1",
                    value: "EURUSD",
                  },
                ],
              },
            ],
            records: [
              {
                id: "rec-1",
                name: "EURUSD Trade",
                icon: null,
                databaseId: "db-1",
                values: [
                  {
                    id: "val-1",
                    recordId: "rec-1",
                    propertyId: "prop-1",
                    value: "EURUSD",
                    computed: false,
                  },
                ],
                content: [],
              },
            ],
            automations: [],
            views: [],
          },
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockSpaceRepo.findByIdForDuplicate.mockResolvedValue(sourceSpace);

      const newSpace = {
        id: "space-2",
        name: "Original Space (copy)",
        icon: "🚀",
        ownerId: "user-1",
        config: null,
        sections: [{ id: "sec-2", name: "Trading", position: 0 }],
        databases: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const newSection = { id: "sec-2", name: "Trading", position: 0, icon: "📊", color: "#3b82f6", spaceId: "space-2" };
      const newDatabase = { id: "db-2", name: "Journal", title: "Trading Journal", icon: "📓", spaceId: "space-2", sectionId: "sec-2" };
      const newProperty = { id: "prop-2", name: "Pair", type: "select", position: 0, databaseId: "db-2" };
      const newTemplate = { id: "tpl-2", name: "Default Template", databaseId: "db-2" };
      const newRecord = { id: "rec-2", name: "EURUSD Trade", icon: null, databaseId: "db-2" };

      (prisma.space.create as jest.Mock<any>).mockResolvedValue(newSpace);
      (prisma.section.create as jest.Mock<any>).mockResolvedValue(newSection);
      (prisma.database.create as jest.Mock<any>).mockResolvedValue(newDatabase);
      (prisma.property.create as jest.Mock<any>).mockResolvedValue(newProperty);
      (prisma.template.create as jest.Mock<any>).mockResolvedValue(newTemplate);
      (prisma.record.create as jest.Mock<any>).mockResolvedValue(newRecord);
      (prisma.propertyValue.create as jest.Mock<any>).mockResolvedValue({ id: "val-2" });
      (prisma.templatePropertyValue.create as jest.Mock<any>).mockResolvedValue({ id: "tpl-val-2" });
      (prisma.space.findUnique as jest.Mock<any>).mockResolvedValue(newSpace);

      const result = await useCase.execute("space-1", "user-1");

      expect(result).toBeDefined();
      expect(prisma.space.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          name: expect.stringContaining("Original Space"),
          icon: "🚀",
          ownerId: "user-1",
        }),
      });
      expect(prisma.section.create).toHaveBeenCalled();
      expect(prisma.database.create).toHaveBeenCalled();
      expect(prisma.property.create).toHaveBeenCalled();
      expect(prisma.template.create).toHaveBeenCalled();
      expect(prisma.templatePropertyValue.create).toHaveBeenCalled();
    });

    it("TC-WS-U-019: should preserve relationships between duplicated entities", async () => {
      const sourceSpace = {
        id: "space-1",
        name: "Space",
        icon: null,
        ownerId: "user-1",
        config: null,
        sections: [{ id: "sec-1", name: "Section", position: 0, icon: null, color: null, spaceId: "space-1" }],
        databases: [
          {
            id: "db-1",
            name: "DB",
            title: "Database",
            icon: null,
            spaceId: "space-1",
            sectionId: "sec-1",
            properties: [
              {
                id: "prop-1",
                name: "Prop",
                type: "text",
                position: 0,
                icon: null,
                isVisible: true,
                databaseId: "db-1",
                config: {},
              },
            ],
            templates: [
              {
                id: "tpl-1",
                name: "Template",
                description: null,
                icon: null,
                namePattern: null,
                content: {},
                isDefault: true,
                position: 0,
                config: null,
                databaseId: "db-1",
                values: [
                  {
                    id: "tpl-val-1",
                    templateId: "tpl-1",
                    propertyId: "prop-1",
                    value: "template value",
                  },
                ],
              },
            ],
            records: [
              {
                id: "rec-1",
                name: "Record",
                icon: null,
                databaseId: "db-1",
                values: [
                  {
                    id: "val-1",
                    recordId: "rec-1",
                    propertyId: "prop-1",
                    value: "test",
                    computed: false,
                  },
                ],
                content: [],
              },
            ],
            automations: [],
            views: [],
          },
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockSpaceRepo.findByIdForDuplicate.mockResolvedValue(sourceSpace);

      const newSpace = {
        id: "space-2",
        name: "Space (copy)",
        icon: null,
        ownerId: "user-1",
        config: null,
        sections: [],
        databases: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const newSection = { id: "sec-2", name: "Section", position: 0, spaceId: "space-2" };
      const newDatabase = { id: "db-2", name: "DB", title: "Database", sectionId: "sec-2", spaceId: "space-2" };
      const newProperty = { id: "prop-2", name: "Prop", type: "text", databaseId: "db-2" };
      const newTemplate = { id: "tpl-2", name: "Template", databaseId: "db-2" };
      const newRecord = { id: "rec-2", name: "Record", databaseId: "db-2" };

      (prisma.space.create as jest.Mock<any>).mockResolvedValue(newSpace);
      (prisma.section.create as jest.Mock<any>).mockResolvedValue(newSection);
      (prisma.database.create as jest.Mock<any>).mockResolvedValue(newDatabase);
      (prisma.property.create as jest.Mock<any>).mockResolvedValue(newProperty);
      (prisma.template.create as jest.Mock<any>).mockResolvedValue(newTemplate);
      (prisma.record.create as jest.Mock<any>).mockResolvedValue(newRecord);
      (prisma.propertyValue.create as jest.Mock<any>).mockResolvedValue({ id: "val-2" });
      (prisma.templatePropertyValue.create as jest.Mock<any>).mockResolvedValue({ id: "tpl-val-2" });
      (prisma.space.findUnique as jest.Mock<any>).mockResolvedValue(newSpace);

      await useCase.execute("space-1", "user-1");

      expect(prisma.database.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          sectionId: "sec-2",
          spaceId: "space-2",
        }),
      });

      expect(prisma.property.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          databaseId: "db-2",
        }),
      });

      expect(prisma.template.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          databaseId: "db-2",
          isDefault: true,
        }),
      });

      expect(prisma.templatePropertyValue.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          templateId: "tpl-2",
          propertyId: "prop-2",
          value: "template value",
        }),
      });
    });

    it("TC-WS-U-020: should use custom name when provided", async () => {
      const sourceSpace = {
        id: "space-1",
        name: "Original",
        icon: null,
        ownerId: "user-1",
        config: null,
        sections: [],
        databases: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockSpaceRepo.findByIdForDuplicate.mockResolvedValue(sourceSpace);

      const newSpace = {
        id: "space-2",
        name: "My Custom Name",
        icon: null,
        ownerId: "user-1",
        config: null,
        sections: [],
        databases: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (prisma.space.create as jest.Mock<any>).mockResolvedValue(newSpace);
      (prisma.space.findUnique as jest.Mock<any>).mockResolvedValue(newSpace);

      await useCase.execute("space-1", "user-1", { newName: "My Custom Name" });

      expect(prisma.space.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          name: "My Custom Name",
        }),
      });
    });

    it("TC-WS-U-021: should throw BadRequestException if space limit of 5 is reached", async () => {
      mockSpaceRepo.count.mockResolvedValue(5);

      await expect(useCase.execute("space-1", "user-1")).rejects.toThrow(BadRequestException);
      expect(prisma.space.create).not.toHaveBeenCalled();
    });
  });
});
