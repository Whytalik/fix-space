import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { NotFoundException } from "@nestjs/common";
import type { TestingModule } from "@nestjs/testing";
import { Test } from "@nestjs/testing";
import { AppLogger } from "../../common/logger/app-logger.service";
import { DatabaseRepository } from "../database.repository";
import { DuplicateDatabaseUseCase } from "../providers/duplicate-database.usecase";

const mockLogger = {
  setContext: jest.fn<any>(),
  log: jest.fn<any>(),
  debug: jest.fn<any>(),
  warn: jest.fn<any>(),
  error: jest.fn<any>(),
};

const mockDatabaseRepo = {
  findByIdForDuplicate: jest.fn<any>(),
  transaction: jest.fn<any>(),
};

const mockSourceDb = {
  id: "db-1",
  spaceId: "space-1",
  sectionId: "sec-1",
  name: "my_db",
  title: "My DB",
  icon: "📁",
  config: { some: "config" },
  properties: [{ id: "prop-1", name: "Name", type: "TEXT", databaseId: "db-1" }],
  records: [
    {
      id: "rec-1",
      name: "Row 1",
      icon: null,
      config: null,
      databaseId: "db-1",
      values: [{ id: "val-1", propertyId: "prop-1", recordId: "rec-1", value: "hello", computed: null }],
    },
  ],
};

describe("DuplicateDatabaseUseCase", () => {
  let useCase: DuplicateDatabaseUseCase;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DuplicateDatabaseUseCase,
        { provide: AppLogger, useValue: mockLogger },
        { provide: DatabaseRepository, useValue: mockDatabaseRepo },
      ],
    }).compile();

    useCase = module.get<DuplicateDatabaseUseCase>(DuplicateDatabaseUseCase);
  });

  describe("execute", () => {
    it("should throw NotFoundException when source database is not found", async () => {
      mockDatabaseRepo.findByIdForDuplicate.mockResolvedValue(null);

      await expect(useCase.execute("db-missing", "user-1")).rejects.toThrow(NotFoundException);
      await expect(useCase.execute("db-missing", "user-1")).rejects.toThrow("Database not found");
    });

    it("should throw NotFoundException when database belongs to another user", async () => {
      mockDatabaseRepo.findByIdForDuplicate.mockResolvedValue(null);

      await expect(useCase.execute("db-1", "user-other")).rejects.toThrow(NotFoundException);
    });

    it("should create new DB, properties, records and values in a transaction", async () => {
      mockDatabaseRepo.findByIdForDuplicate.mockResolvedValue(mockSourceDb);

      const newDb = {
        id: "db-new",
        title: "My DB Copy",
        name: "my_db_copy",
        spaceId: "space-1",
        sectionId: "sec-1",
        icon: "📁",
        config: { some: "config" },
      };
      const newProp = { id: "prop-new" };
      const newRecord = { id: "rec-new" };
      const newValue = { id: "val-new" };

      const mockTx = {
        database: { create: jest.fn<any>().mockResolvedValue(newDb) },
        property: { create: jest.fn<any>().mockResolvedValue(newProp) },
        record: { create: jest.fn<any>().mockResolvedValue(newRecord) },
        propertyValue: { create: jest.fn<any>().mockResolvedValue(newValue) },
      };

      mockDatabaseRepo.transaction.mockImplementation(async (cb: (tx: typeof mockTx) => Promise<unknown>) =>
        cb(mockTx),
      );

      await useCase.execute("db-1", "user-1");

      expect(mockTx.database.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            title: "My DB Copy",
            name: "my_db_copy",
            spaceId: "space-1",
            sectionId: "sec-1",
          }),
        }),
      );
      expect(mockTx.property.create).toHaveBeenCalledTimes(1);
      expect(mockTx.record.create).toHaveBeenCalledTimes(1);
      expect(mockTx.propertyValue.create).toHaveBeenCalledTimes(1);
    });

    it("should skip property values when propertyIdMap has no entry", async () => {
      const sourceWithOrphan = {
        ...mockSourceDb,
        properties: [],
        records: [
          {
            ...mockSourceDb.records[0],
            values: [{ id: "val-orphan", propertyId: "prop-orphan", recordId: "rec-1", value: "x", computed: null }],
          },
        ],
      };

      mockDatabaseRepo.findByIdForDuplicate.mockResolvedValue(sourceWithOrphan);

      const newDb = { id: "db-new", title: "My DB Copy" };
      const newRecord = { id: "rec-new" };

      const mockTx = {
        database: { create: jest.fn<any>().mockResolvedValue(newDb) },
        property: { create: jest.fn<any>() },
        record: { create: jest.fn<any>().mockResolvedValue(newRecord) },
        propertyValue: { create: jest.fn<any>() },
      };

      mockDatabaseRepo.transaction.mockImplementation(async (cb: (tx: typeof mockTx) => Promise<unknown>) =>
        cb(mockTx),
      );

      await useCase.execute("db-1", "user-1");

      expect(mockTx.propertyValue.create).not.toHaveBeenCalled();
    });

    it("should rethrow unknown errors", async () => {
      mockDatabaseRepo.findByIdForDuplicate.mockRejectedValue(new Error("DB error"));

      await expect(useCase.execute("db-1", "user-1")).rejects.toThrow("DB error");
    });
  });
});
