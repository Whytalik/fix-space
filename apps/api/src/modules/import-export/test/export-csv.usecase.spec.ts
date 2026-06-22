import { NotFoundException } from "@nestjs/common";
import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import type { TestingModule } from "@nestjs/testing";
import { Test } from "@nestjs/testing";
import { NotificationType } from "@fixspace/database";
import { PropertyType } from "@fixspace/domain";
import { AppLogger } from "@/common/logger/app-logger.service";
import { NotificationService } from "@/modules/notification/notification.service";
import { ExportCsvUseCase } from "../providers/export-csv.usecase";
import { ImportExportRepository } from "../repositories/import-export.repository";

describe("ExportCsvUseCase", () => {
  let useCase: ExportCsvUseCase;

  const mockLogger = {
    setContext: jest.fn(),
    debug: jest.fn(),
    log: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  } as unknown as jest.Mocked<AppLogger>;

  const mockRepo = {
    findDatabaseByOwner: jest.fn(),
    findPropertiesByDatabase: jest.fn(),
    findRecordsWithValues: jest.fn(),
    findViewById: jest.fn(),
  } as unknown as jest.Mocked<ImportExportRepository>;

  const mockNotifService = {
    create: jest.fn(),
  } as unknown as jest.Mocked<NotificationService>;

  const database = { id: "db-1", name: "Trading Journal" };
  const nameProperty = { id: "p-name", name: "Name", type: PropertyType.TEXT };
  const textProperty = { id: "p-text", name: "Notes", type: PropertyType.TEXT };
  const formulaProperty = { id: "p-formula", name: "Formula", type: PropertyType.FORMULA };
  const relationProperty = { id: "p-rel", name: "Relation", type: PropertyType.RELATION };
  const record = {
    id: "r-1",
    name: "Record 1",
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-02"),
    values: [{ propertyId: "p-text", value: "some note" }],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExportCsvUseCase,
        { provide: AppLogger, useValue: mockLogger },
        { provide: ImportExportRepository, useValue: mockRepo },
        { provide: NotificationService, useValue: mockNotifService },
      ],
    }).compile();

    useCase = module.get<ExportCsvUseCase>(ExportCsvUseCase);
    jest.clearAllMocks();

    mockNotifService.create.mockResolvedValue(undefined as any);
  });

  describe("execute", () => {
    it("TC-IMP-U-001: should throw NotFoundException when database not found", async () => {
      mockRepo.findDatabaseByOwner.mockResolvedValue(null as any);

      await expect(useCase.execute("db-1", "u-1")).rejects.toThrow(NotFoundException);
    });

    it("TC-IMP-U-002: should return CSV buffer and filename", async () => {
      mockRepo.findDatabaseByOwner.mockResolvedValue(database as any);
      mockRepo.findPropertiesByDatabase.mockResolvedValue([nameProperty, textProperty] as any);
      mockRepo.findRecordsWithValues.mockResolvedValue([record] as any);

      const result = await useCase.execute("db-1", "u-1");

      expect(result.csv).toBeInstanceOf(Buffer);
      expect(result.filename).toMatch(/trading_journal_export_\d{4}-\d{2}-\d{2}\.csv/);
    });

    it("TC-IMP-U-003: should exclude FORMULA and RELATION properties from export", async () => {
      mockRepo.findDatabaseByOwner.mockResolvedValue(database as any);
      mockRepo.findPropertiesByDatabase.mockResolvedValue([textProperty, formulaProperty, relationProperty] as any);
      mockRepo.findRecordsWithValues.mockResolvedValue([record] as any);

      const result = await useCase.execute("db-1", "u-1");
      const csvString = result.csv.toString("utf-8");

      expect(csvString).toContain("Notes");
      expect(csvString).not.toContain("Formula");
      expect(csvString).not.toContain("Relation");
    });

    it("TC-IMP-U-004: should filter by propertyIds when provided", async () => {
      mockRepo.findDatabaseByOwner.mockResolvedValue(database as any);
      mockRepo.findPropertiesByDatabase.mockResolvedValue([textProperty, nameProperty] as any);
      mockRepo.findRecordsWithValues.mockResolvedValue([record] as any);

      const result = await useCase.execute("db-1", "u-1", { propertyIds: ["p-text"] });
      const csvString = result.csv.toString("utf-8");

      expect(csvString).toContain("Notes");
    });

    it("TC-IMP-U-005: should include meta fields (Name, Created At, Updated At) by default", async () => {
      mockRepo.findDatabaseByOwner.mockResolvedValue(database as any);
      mockRepo.findPropertiesByDatabase.mockResolvedValue([nameProperty, textProperty] as any);
      mockRepo.findRecordsWithValues.mockResolvedValue([record] as any);

      const result = await useCase.execute("db-1", "u-1");
      const csvString = result.csv.toString("utf-8");

      expect(csvString).toContain("Name");
      expect(csvString).toContain("Created At");
      expect(csvString).toContain("Updated At");
    });

    it("TC-IMP-U-006: should omit meta fields when includeMetaFields is false", async () => {
      mockRepo.findDatabaseByOwner.mockResolvedValue(database as any);
      mockRepo.findPropertiesByDatabase.mockResolvedValue([textProperty] as any);
      mockRepo.findRecordsWithValues.mockResolvedValue([record] as any);

      const result = await useCase.execute("db-1", "u-1", { includeMetaFields: false });
      const csvString = result.csv.toString("utf-8");

      expect(csvString).not.toContain("Created At");
      expect(csvString).not.toContain("Updated At");
    });

    it("TC-IMP-U-007: should create info notification after export", async () => {
      mockRepo.findDatabaseByOwner.mockResolvedValue(database as any);
      mockRepo.findPropertiesByDatabase.mockResolvedValue([textProperty] as any);
      mockRepo.findRecordsWithValues.mockResolvedValue([record] as any);

      await useCase.execute("db-1", "u-1");

      expect(mockNotifService.create).toHaveBeenCalledWith("u-1", NotificationType.INFO, expect.any(String));
    });
  });
});
