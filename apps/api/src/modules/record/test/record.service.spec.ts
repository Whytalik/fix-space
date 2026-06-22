import { NotFoundException } from "@nestjs/common";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import type { TestingModule } from "@nestjs/testing";
import { Test } from "@nestjs/testing";
import { AppLogger } from "@/common/logger/app-logger.service";
import { RecordService } from "../record.service";
import { RecordRepository } from "../repositories/record.repository";
import { SettingsService } from "@/modules/settings/settings.service";
import { FormulaRecalculator } from "@/modules/property/types/formula/formula-recalculator.service";
import { DatabaseRepository } from "@/modules/database/repositories/database.repository";
import { PropertyRepository } from "@/modules/property/repositories/property.repository";
import { TemplateRepository } from "@/modules/template/repositories/template.repository";
import { RecordContentService } from "@/modules/record-content/record-content.service";
import { ViewRepository } from "@/modules/view/repositories/view.repository";

jest.mock("@fixspace/database", () => ({
  Prisma: {
    DbNull: null,
    InputJsonValue: undefined,
  },
  prisma: {
    record: { create: jest.fn(), findUnique: jest.fn(), findUniqueOrThrow: jest.fn() },
    propertyValue: { create: jest.fn() },
    $transaction: jest.fn((callback: (tx: unknown) => unknown) => callback(prisma)),
  },
}));

import { prisma } from "@fixspace/database";

describe("RecordService", () => {
  let service: RecordService;

  const mockLogger: jest.Mocked<AppLogger> = {
    setContext: jest.fn(),
    debug: jest.fn(),
    log: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  } as unknown as jest.Mocked<AppLogger>;

  const mockSettingsService = {
    getDefaultIcon: jest.fn(),
  };

  const mockFormulaRecalculator = {
    recalculate: jest.fn().mockResolvedValue(undefined),
  };

  const mockRecordRepo = {
    findById: jest.fn(),
    findUniqueOrThrowWithValues: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    transaction: jest.fn((callback) => callback(prisma)),
  };

  const mockDatabaseRepo = {
    findDatabaseByOwner: jest.fn(),
  };

  const mockPropertyRepo = {
    findManyByDatabase: jest.fn(),
  };

  const mockTemplateRepo = {
    findDefaultInDatabase: jest.fn(),
  };

  const mockEventEmitter = { emitAsync: jest.fn().mockResolvedValue([]) };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RecordService,
        { provide: RecordRepository, useValue: mockRecordRepo },
        { provide: EventEmitter2, useValue: mockEventEmitter },
        { provide: SettingsService, useValue: mockSettingsService },
        { provide: FormulaRecalculator, useValue: mockFormulaRecalculator },
        { provide: RecordContentService, useValue: { duplicate: jest.fn() } },
        { provide: ViewRepository, useValue: { findById: jest.fn() } },
        { provide: DatabaseRepository, useValue: mockDatabaseRepo },
        { provide: PropertyRepository, useValue: mockPropertyRepo },
        { provide: TemplateRepository, useValue: mockTemplateRepo },
        { provide: AppLogger, useValue: mockLogger },
      ],
    }).compile();

    service = module.get<RecordService>(RecordService);

    jest.clearAllMocks();
  });

  describe("duplicate", () => {
    it("TC-REC-U-011: should throw NotFoundException when source record not found", async () => {
      mockRecordRepo.findById.mockResolvedValue(null);

      await expect(service.duplicate("nonexistent")).rejects.toThrow(NotFoundException);
    });

    it("TC-REC-U-012: should duplicate record with all property values", async () => {
      const sourceRecord = {
        id: "rec-1",
        databaseId: "db-1",
        name: "My Record",
        icon: "📝",
        values: [
          { id: "val-1", recordId: "rec-1", propertyId: "prop-1", value: "Test Value", computed: false },
          { id: "val-2", recordId: "rec-1", propertyId: "prop-2", value: 42, computed: false },
        ],
      };

      const newRecord = { id: "rec-2", databaseId: "db-1", name: "My Record (Copy)", icon: "📝", values: [] };
      const newRecordWithValues = {
        ...newRecord,
        values: [
          { id: "val-3", recordId: "rec-2", propertyId: "prop-1", value: "Test Value", computed: false },
          { id: "val-4", recordId: "rec-2", propertyId: "prop-2", value: 42, computed: false },
        ],
      };

      mockRecordRepo.findById.mockResolvedValue(sourceRecord);
      mockRecordRepo.create.mockResolvedValue(newRecord);
      mockRecordRepo.findUniqueOrThrowWithValues.mockResolvedValue(newRecordWithValues);

      const result = await service.duplicate("rec-1");

      expect(result).toBeDefined();
      expect(mockRecordRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          databaseId: "db-1",
          name: "My Record (Copy)",
          icon: "📝",
        }),
        expect.anything(),
      );
      expect(prisma.propertyValue.create).toHaveBeenCalledTimes(2);
      expect(prisma.propertyValue.create).toHaveBeenCalledWith({
        data: expect.objectContaining({ recordId: "rec-2", propertyId: "prop-1", value: "Test Value" }),
      });
    });

    it("TC-REC-U-003: should copy all property values to the new record", async () => {
      const sourceRecord = {
        id: "rec-1",
        databaseId: "db-1",
        name: "Record",
        icon: null,
        values: [{ id: "val-1", recordId: "rec-1", propertyId: "prop-A", value: "hello", computed: false }],
      };

      const newRecord = { id: "rec-2", databaseId: "db-1", name: "Record (Copy)", icon: null, values: [] };
      mockRecordRepo.findById.mockResolvedValue(sourceRecord);
      mockRecordRepo.create.mockResolvedValue(newRecord);
      mockRecordRepo.findUniqueOrThrowWithValues.mockResolvedValue({
        ...newRecord,
        values: [{ id: "val-2", recordId: "rec-2", propertyId: "prop-A", value: "hello", computed: false }],
      });

      await service.duplicate("rec-1");

      expect(prisma.propertyValue.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          recordId: "rec-2",
          propertyId: "prop-A",
          value: "hello",
          computed: false,
        }),
      });
    });
  });
});
