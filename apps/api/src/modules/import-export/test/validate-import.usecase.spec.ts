import { NotFoundException } from "@nestjs/common";
import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import type { TestingModule } from "@nestjs/testing";
import { Test } from "@nestjs/testing";
import { PropertyType } from "@fixspace/domain";
import { AppLogger } from "@/common/logger/app-logger.service";
import { PropertyTypeRegistry } from "@/modules/property/types";
import { ValidateImportUseCase } from "../providers/validate-import.usecase";
import { ImportExportRepository } from "../repositories/import-export.repository";

const mockLogger = {
  setContext: jest.fn(),
  debug: jest.fn(),
  log: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
} as unknown as AppLogger;

const mockRepo = {
  findDatabaseByOwner: jest.fn(),
  findPropertiesByDatabase: jest.fn(),
  countRecords: jest.fn(),
  findDefaultViewLimit: jest.fn(),
} as unknown as jest.Mocked<ImportExportRepository>;

const mockRegistry = {
  resolveHandlerAndConfig: jest.fn(),
} as unknown as jest.Mocked<PropertyTypeRegistry>;

const noOpHandler = { validateValue: () => null };

function mockFile(content: string): Express.Multer.File {
  const buf = Buffer.from(content, "utf-8");
  return { buffer: buf, mimetype: "text/csv", originalname: "test.csv", size: buf.length } as Express.Multer.File;
}

describe("ValidateImportUseCase", () => {
  let useCase: ValidateImportUseCase;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ValidateImportUseCase,
        { provide: AppLogger, useValue: mockLogger },
        { provide: ImportExportRepository, useValue: mockRepo },
        { provide: PropertyTypeRegistry, useValue: mockRegistry },
      ],
    }).compile();

    useCase = module.get<ValidateImportUseCase>(ValidateImportUseCase);
    jest.clearAllMocks();

    (mockRepo.findDefaultViewLimit as jest.MockedFunction<typeof mockRepo.findDefaultViewLimit>).mockResolvedValue(null as any);
  });

  it("TC-IMP-U-023: should throw NotFoundException when database is not found", async () => {
    (mockRepo.findDatabaseByOwner as jest.MockedFunction<typeof mockRepo.findDatabaseByOwner>).mockResolvedValue(null as any);

    await expect(useCase.execute(mockFile("a,b\n1,2"), "db-1", {}, "u-1")).rejects.toThrow(NotFoundException);
  });

  it("TC-IMP-U-024: should detect unknown SELECT options and populate unknownOptions array", async () => {
    (mockRepo.findDatabaseByOwner as jest.MockedFunction<typeof mockRepo.findDatabaseByOwner>).mockResolvedValue({ id: "db-1" } as any);
    const selectProp = {
      id: "p-sel",
      name: "Direction",
      type: PropertyType.SELECT,
      config: { categories: [{ options: [{ value: "Long" }, { value: "Short" }] }] },
    };
    (mockRepo.findPropertiesByDatabase as jest.MockedFunction<typeof mockRepo.findPropertiesByDatabase>).mockResolvedValue([
      selectProp,
    ] as any);
    (mockRegistry.resolveHandlerAndConfig as jest.MockedFunction<typeof mockRegistry.resolveHandlerAndConfig>).mockReturnValue({
      handler: noOpHandler as any,
      config: selectProp.config,
    });

    const csv = "Direction\nLong\nSideways";
    const mapping = { Direction: "p-sel" };

    const result = await useCase.execute(mockFile(csv), "db-1", mapping, "u-1");

    expect(result.unknownOptions).toHaveLength(1);
    expect(result.unknownOptions![0].propertyId).toBe("p-sel");
    expect(result.unknownOptions![0].propertyName).toBe("Direction");
    expect(result.unknownOptions![0].values).toContain("Sideways");
  });

  it("TC-IMP-U-025: should count unknown-option-only rows in unknownOptionRowCount, not skippedRows", async () => {
    (mockRepo.findDatabaseByOwner as jest.MockedFunction<typeof mockRepo.findDatabaseByOwner>).mockResolvedValue({ id: "db-1" } as any);
    const selectProp = {
      id: "p-sel",
      name: "Direction",
      type: PropertyType.SELECT,
      config: { categories: [{ options: [{ value: "Long" }] }] },
    };
    (mockRepo.findPropertiesByDatabase as jest.MockedFunction<typeof mockRepo.findPropertiesByDatabase>).mockResolvedValue([
      selectProp,
    ] as any);
    (mockRegistry.resolveHandlerAndConfig as jest.MockedFunction<typeof mockRegistry.resolveHandlerAndConfig>).mockReturnValue({
      handler: noOpHandler as any,
      config: selectProp.config,
    });

    const csv = "Direction\nLong\nShort";
    const mapping = { Direction: "p-sel" };

    const result = await useCase.execute(mockFile(csv), "db-1", mapping, "u-1");

    expect(result.validRows).toBe(1);
    expect(result.unknownOptionRowCount).toBe(1);
    expect(result.skippedRows).toHaveLength(0);
  });

  it("TC-IMP-U-026: should place rows with real type errors in skippedRows (not unknownOptionRowCount)", async () => {
    (mockRepo.findDatabaseByOwner as jest.MockedFunction<typeof mockRepo.findDatabaseByOwner>).mockResolvedValue({ id: "db-1" } as any);
    const numberProp = { id: "p-num", name: "Quantity", type: PropertyType.NUMBER, config: {} };
    (mockRepo.findPropertiesByDatabase as jest.MockedFunction<typeof mockRepo.findPropertiesByDatabase>).mockResolvedValue([
      numberProp,
    ] as any);
    (mockRegistry.resolveHandlerAndConfig as jest.MockedFunction<typeof mockRegistry.resolveHandlerAndConfig>).mockReturnValue({
      handler: noOpHandler as any,
      config: {},
    });

    const csv = "Quantity\nnotanumber\n42";
    const mapping = { Quantity: "p-num" };

    const result = await useCase.execute(mockFile(csv), "db-1", mapping, "u-1");

    expect(result.skippedRows).toHaveLength(1);
    expect(result.skippedRows[0].rowIndex).toBe(1);
    expect(result.validRows).toBe(1);
    expect(result.unknownOptionRowCount).toBe(0);
  });

  it("TC-IMP-U-027: should join multiple field errors per row with newline", async () => {
    (mockRepo.findDatabaseByOwner as jest.MockedFunction<typeof mockRepo.findDatabaseByOwner>).mockResolvedValue({ id: "db-1" } as any);
    const numberProp = { id: "p-num", name: "Quantity", type: PropertyType.NUMBER, config: {} };
    const dateProp = { id: "p-date", name: "Entry Date", type: PropertyType.DATE, config: {} };
    (mockRepo.findPropertiesByDatabase as jest.MockedFunction<typeof mockRepo.findPropertiesByDatabase>).mockResolvedValue([
      numberProp,
      dateProp,
    ] as any);
    (mockRegistry.resolveHandlerAndConfig as jest.MockedFunction<typeof mockRegistry.resolveHandlerAndConfig>).mockReturnValue({
      handler: noOpHandler as any,
      config: {},
    });

    const csv = "Quantity,Entry Date\nbadnum,baddate";
    const mapping = { Quantity: "p-num", "Entry Date": "p-date" };

    const result = await useCase.execute(mockFile(csv), "db-1", mapping, "u-1");

    expect(result.skippedRows).toHaveLength(1);
    expect(result.skippedRows[0].reason).toContain("\n");
    const lines = result.skippedRows[0].reason.split("\n");
    expect(lines).toHaveLength(2);
  });
});
