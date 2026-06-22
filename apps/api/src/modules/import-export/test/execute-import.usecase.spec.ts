import { NotFoundException } from "@nestjs/common";
import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import type { TestingModule } from "@nestjs/testing";
import { Test } from "@nestjs/testing";
import { NotificationType } from "@fixspace/database";
import { PropertyType } from "@fixspace/domain";
import { AppLogger } from "@/common/logger/app-logger.service";
import { PropertyTypeRegistry } from "@/modules/property/types";
import { NotificationService } from "@/modules/notification/notification.service";
import { ExecuteImportUseCase } from "../providers/execute-import.usecase";
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
  createRecordsBulk: jest.fn(),
  transaction: jest.fn(),
  updatePropertyConfig: jest.fn(),
} as unknown as jest.Mocked<ImportExportRepository>;

const mockRegistry = {
  resolveHandlerAndConfig: jest.fn(),
} as unknown as jest.Mocked<PropertyTypeRegistry>;

const mockNotifService = {
  create: jest.fn(),
} as unknown as jest.Mocked<NotificationService>;

const noOpHandler = { validateValue: () => null };

function mockFile(content: string): Express.Multer.File {
  const buf = Buffer.from(content, "utf-8");
  return { buffer: buf, mimetype: "text/csv", originalname: "test.csv", size: buf.length } as Express.Multer.File;
}

describe("ExecuteImportUseCase", () => {
  let useCase: ExecuteImportUseCase;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExecuteImportUseCase,
        { provide: AppLogger, useValue: mockLogger },
        { provide: ImportExportRepository, useValue: mockRepo },
        { provide: PropertyTypeRegistry, useValue: mockRegistry },
        { provide: NotificationService, useValue: mockNotifService },
      ],
    }).compile();

    useCase = module.get<ExecuteImportUseCase>(ExecuteImportUseCase);
    jest.clearAllMocks();

    (mockRepo.transaction as jest.MockedFunction<typeof mockRepo.transaction>).mockImplementation(
      async (cb: (tx: unknown) => Promise<unknown>) => cb({}),
    );
    (mockRepo.createRecordsBulk as jest.MockedFunction<typeof mockRepo.createRecordsBulk>).mockResolvedValue(1 as any);
    (mockNotifService.create as jest.MockedFunction<typeof mockNotifService.create>).mockResolvedValue(undefined as any);
  });

  it("TC-IMP-U-028: should throw NotFoundException when database is not found", async () => {
    (mockRepo.findDatabaseByOwner as jest.MockedFunction<typeof mockRepo.findDatabaseByOwner>).mockResolvedValue(null as any);

    await expect(useCase.execute(mockFile("a,b\n1,2"), "db-1", {}, "u-1")).rejects.toThrow(NotFoundException);
  });

  it("TC-IMP-U-029: should import valid rows and return imported count", async () => {
    (mockRepo.findDatabaseByOwner as jest.MockedFunction<typeof mockRepo.findDatabaseByOwner>).mockResolvedValue({ id: "db-1" } as any);
    const textProp = { id: "p-txt", name: "Notes", type: PropertyType.TEXT, config: {} };
    (mockRepo.findPropertiesByDatabase as jest.MockedFunction<typeof mockRepo.findPropertiesByDatabase>).mockResolvedValue([
      textProp,
    ] as any);
    (mockRegistry.resolveHandlerAndConfig as jest.MockedFunction<typeof mockRegistry.resolveHandlerAndConfig>).mockReturnValue({
      handler: noOpHandler as any,
      config: {},
    });

    const csv = "Notes\nhello\nworld";
    const mapping = { Notes: "p-txt" };

    const result = await useCase.execute(mockFile(csv), "db-1", mapping, "u-1");

    expect(result.imported).toBe(2);
    expect(result.skipped).toBe(0);
  });

  it("TC-IMP-U-030: should skip rows with type errors when partialImport is false", async () => {
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

    const result = await useCase.execute(mockFile(csv), "db-1", mapping, "u-1", { partialImport: false });

    expect(result.imported).toBe(1);
    expect(result.skipped).toBe(1);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0].rowIndex).toBe(1);
  });

  it("TC-IMP-U-031: should import row with field errors when partialImport is true (skipping invalid field)", async () => {
    (mockRepo.findDatabaseByOwner as jest.MockedFunction<typeof mockRepo.findDatabaseByOwner>).mockResolvedValue({ id: "db-1" } as any);
    const numberProp = { id: "p-num", name: "Quantity", type: PropertyType.NUMBER, config: {} };
    const textProp = { id: "p-txt", name: "Notes", type: PropertyType.TEXT, config: {} };
    (mockRepo.findPropertiesByDatabase as jest.MockedFunction<typeof mockRepo.findPropertiesByDatabase>).mockResolvedValue([
      numberProp,
      textProp,
    ] as any);
    (mockRegistry.resolveHandlerAndConfig as jest.MockedFunction<typeof mockRegistry.resolveHandlerAndConfig>).mockReturnValue({
      handler: noOpHandler as any,
      config: {},
    });

    const csv = "Quantity,Notes\nnotanumber,valid text";
    const mapping = { Quantity: "p-num", Notes: "p-txt" };

    const result = await useCase.execute(mockFile(csv), "db-1", mapping, "u-1", { partialImport: true });

    expect(result.imported).toBe(1);
    expect(result.skipped).toBe(0);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0].reason).toContain("Quantity");
    const createCall = (mockRepo.createRecordsBulk as jest.MockedFunction<typeof mockRepo.createRecordsBulk>).mock.calls[0]?.[0];
    expect(createCall).toBeDefined();
    const values = (createCall as Array<{ name: string; values: Array<{ propertyId: string }> }>)[0]?.values;
    expect(values?.every((v) => v.propertyId !== "p-num")).toBe(true);
    expect(values?.some((v) => v.propertyId === "p-txt")).toBe(true);
  });

  it("TC-IMP-U-032: should deduplicate property values when two CSV columns map to the same property", async () => {
    (mockRepo.findDatabaseByOwner as jest.MockedFunction<typeof mockRepo.findDatabaseByOwner>).mockResolvedValue({ id: "db-1" } as any);
    const textProp = { id: "p-txt", name: "Notes", type: PropertyType.TEXT, config: {} };
    (mockRepo.findPropertiesByDatabase as jest.MockedFunction<typeof mockRepo.findPropertiesByDatabase>).mockResolvedValue([
      textProp,
    ] as any);
    (mockRegistry.resolveHandlerAndConfig as jest.MockedFunction<typeof mockRegistry.resolveHandlerAndConfig>).mockReturnValue({
      handler: noOpHandler as any,
      config: {},
    });

    const csv = "ColA,ColB\nhello,world";
    const mapping = { ColA: "p-txt", ColB: "p-txt" };

    const result = await useCase.execute(mockFile(csv), "db-1", mapping, "u-1");

    expect(result.imported).toBe(1);
    const createCall = (mockRepo.createRecordsBulk as jest.MockedFunction<typeof mockRepo.createRecordsBulk>).mock.calls[0]?.[0];
    const values = (createCall as Array<{ values: Array<{ propertyId: string }> }>)[0]?.values;
    const uniquePropertyIds = new Set(values?.map((v) => v.propertyId));
    expect(uniquePropertyIds.size).toBe(values?.length);
  });

  it("TC-IMP-U-033: should send INFO notification after successful import", async () => {
    (mockRepo.findDatabaseByOwner as jest.MockedFunction<typeof mockRepo.findDatabaseByOwner>).mockResolvedValue({ id: "db-1" } as any);
    (mockRepo.findPropertiesByDatabase as jest.MockedFunction<typeof mockRepo.findPropertiesByDatabase>).mockResolvedValue([] as any);

    const csv = "Notes\nhello";
    await useCase.execute(mockFile(csv), "db-1", {}, "u-1");

    expect(mockNotifService.create).toHaveBeenCalledWith("u-1", NotificationType.INFO, expect.any(String));
  });

  it("TC-IMP-U-034: patchUnknownOptions — adds new values to SELECT property config", async () => {
    (mockRepo.findDatabaseByOwner as jest.MockedFunction<typeof mockRepo.findDatabaseByOwner>).mockResolvedValue({ id: "db-1" } as any);
    const selectProp = {
      id: "p-sel",
      name: "Direction",
      type: PropertyType.SELECT,
      config: { categories: [{ options: [{ value: "Long" }] }] },
    };
    const updatedProp = {
      ...selectProp,
      config: { categories: [{ options: [{ value: "Long" }, { value: "Sideways" }] }] },
    };
    (mockRepo.findPropertiesByDatabase as jest.MockedFunction<typeof mockRepo.findPropertiesByDatabase>).mockResolvedValue([
      selectProp,
    ] as any);
    (mockRegistry.resolveHandlerAndConfig as jest.MockedFunction<typeof mockRegistry.resolveHandlerAndConfig>).mockReturnValue({
      handler: noOpHandler as any,
      config: { categories: [{ options: [{ value: "Long" }, { value: "Sideways" }] }] },
    });
    (mockRepo.updatePropertyConfig as jest.MockedFunction<typeof mockRepo.updatePropertyConfig>).mockResolvedValue(updatedProp as any);

    const csv = "Direction\nLong\nSideways";
    const mapping = { Direction: "p-sel" };

    const result = await useCase.execute(mockFile(csv), "db-1", mapping, "u-1", {
      addUnknownOptionPropertyIds: ["p-sel"],
    });

    expect(mockRepo.updatePropertyConfig).toHaveBeenCalledWith("p-sel", {
      categories: [{ options: [{ value: "Long" }, { value: "Sideways" }] }],
    });
    expect(result.imported).toBe(2);
  });
});
