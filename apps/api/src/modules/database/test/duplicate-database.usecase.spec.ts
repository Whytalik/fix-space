import { NotFoundException } from "@nestjs/common";
import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import type { TestingModule } from "@nestjs/testing";
import { Test } from "@nestjs/testing";
import { AppLogger } from "../../../common/logger/app-logger.service";
import { DuplicateDatabaseUseCase } from "../providers/duplicate-database.usecase";
import { DatabaseRepository } from "../repositories/database.repository";

jest.mock("@fixspace/database", () => ({
  Prisma: {
    InputJsonValue: undefined,
  },
  prisma: {
    database: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    property: { create: jest.fn() },
    record: { create: jest.fn() },
    propertyValue: { create: jest.fn() },
    $transaction: jest.fn((cb: (tx: unknown) => unknown) => cb(prisma)),
  },
}));

import { prisma } from "@fixspace/database";

describe("DuplicateDatabaseUseCase", () => {
  let useCase: DuplicateDatabaseUseCase;

  const mockLogger: jest.Mocked<AppLogger> = {
    setContext: jest.fn(),
    debug: jest.fn(),
    log: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  } as unknown as jest.Mocked<AppLogger>;

  const mockDatabaseRepo = {
    findByIdForDuplicate: jest.fn(),
    transaction: jest.fn((cb) => cb(prisma)),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DuplicateDatabaseUseCase,
        { provide: DatabaseRepository, useValue: mockDatabaseRepo },
        { provide: AppLogger, useValue: mockLogger },
      ],
    }).compile();

    useCase = module.get<DuplicateDatabaseUseCase>(DuplicateDatabaseUseCase);

    jest.clearAllMocks();
  });

  describe("execute", () => {
    it("TC-DB-U-006: should throw NotFoundException when source database not found", async () => {
      mockDatabaseRepo.findByIdForDuplicate.mockResolvedValue(null);

      await expect(useCase.execute("nonexistent")).rejects.toThrow(NotFoundException);
    });

    it("TC-DB-U-006: should duplicate database with properties, records, and values", async () => {
      const sourceDb = {
        id: "db-1",
        name: "original-db",
        title: "Original DB",
        icon: "📊",
        spaceId: "space-1",
        sectionId: "sec-1",
        properties: [
          {
            id: "prop-1",
            name: "Name",
            type: "TEXT",
            position: 0,
            icon: null,
            isRequired: false,
            isVisible: true,
            databaseId: "db-1",
            config: {},
          },
        ],
        records: [
          {
            id: "rec-1",
            name: "Record 1",
            icon: null,
            databaseId: "db-1",
            values: [
              {
                id: "val-1",
                recordId: "rec-1",
                propertyId: "prop-1",
                value: "Test Value",
                computed: false,
              },
            ],
          },
        ],
      };

      mockDatabaseRepo.findByIdForDuplicate.mockResolvedValue(sourceDb);

      const newDb = {
        id: "db-2",
        name: "original-db-copy",
        title: "Original DB (copy)",
        icon: "📊",
        spaceId: "space-1",
        sectionId: "sec-1",
      };
      const newProperty = { id: "prop-2", name: "Name", type: "TEXT", databaseId: "db-2" };
      const newRecord = { id: "rec-2", name: "Record 1", databaseId: "db-2" };

      (prisma.database.create as jest.Mock<any>).mockResolvedValue(newDb);
      (prisma.property.create as jest.Mock<any>).mockResolvedValue(newProperty);
      (prisma.record.create as jest.Mock<any>).mockResolvedValue(newRecord);
      (prisma.propertyValue.create as jest.Mock<any>).mockResolvedValue({ id: "val-2" });

      const result = await useCase.execute("db-1");

      expect(result).toBeDefined();
      expect(prisma.database.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          spaceId: "space-1",
          sectionId: "sec-1",
          title: expect.stringContaining("Original DB"),
        }),
      });
      expect(prisma.property.create).toHaveBeenCalled();
      expect(prisma.record.create).toHaveBeenCalled();
      expect(prisma.propertyValue.create).toHaveBeenCalled();
    });

    it("TC-DB-U-006: should map property IDs correctly for record values", async () => {
      const sourceDb = {
        id: "db-1",
        name: "source-db",
        title: "Source DB",
        icon: null,
        spaceId: "space-1",
        sectionId: null,
        properties: [
          {
            id: "prop-1",
            name: "Prop",
            type: "text",
            position: 0,
            icon: null,
            isRequired: false,
            isVisible: true,
            databaseId: "db-1",
            config: {},
          },
        ],
        records: [
          {
            id: "rec-1",
            name: "Record",
            icon: null,
            databaseId: "db-1",
            values: [{ id: "val-1", recordId: "rec-1", propertyId: "prop-1", value: "value", computed: false }],
          },
        ],
      };

      mockDatabaseRepo.findByIdForDuplicate.mockResolvedValue(sourceDb);

      const newDb = { id: "db-2", name: "source-db-copy", title: "Source DB (copy)", icon: null, spaceId: "space-1", sectionId: null };
      const newProperty = { id: "prop-2", name: "Prop", type: "text", databaseId: "db-2" };
      const newRecord = { id: "rec-2", name: "Record", databaseId: "db-2" };

      (prisma.database.create as jest.Mock<any>).mockResolvedValue(newDb);
      (prisma.property.create as jest.Mock<any>).mockResolvedValue(newProperty);
      (prisma.record.create as jest.Mock<any>).mockResolvedValue(newRecord);
      (prisma.propertyValue.create as jest.Mock<any>).mockResolvedValue({ id: "val-2" });

      await useCase.execute("db-1");

      expect(prisma.propertyValue.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          recordId: "rec-2",
          propertyId: "prop-2",
          value: "value",
        }),
      });
    });
  });
});
