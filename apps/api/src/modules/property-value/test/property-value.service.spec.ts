import { BadRequestException, ConflictException, NotFoundException } from "@nestjs/common";
import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import type { TestingModule } from "@nestjs/testing";
import { Test } from "@nestjs/testing";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { AppLogger } from "@/common/logger/app-logger.service";
import { PropertyTypeRegistry } from "@/modules/property/types";
import { FormulaRecalculator } from "@/modules/property/types/formula/formula-recalculator.service";
import { PropertyValueService } from "../property-value.service";
import { PropertyValueRepository } from "../repositories/property-value.repository";
import { RecordRepository } from "@/modules/record/repositories/record.repository";
import { PropertyRepository } from "@/modules/property/repositories/property.repository";

describe("PropertyValueService", () => {
  let service: PropertyValueService;

  const mockLogger = {
    setContext: jest.fn(),
    debug: jest.fn(),
    log: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  } as unknown as jest.Mocked<AppLogger>;

  const mockEventEmitter = {
    emitAsync: jest.fn(),
  } as unknown as jest.Mocked<EventEmitter2>;

  const mockHandler = {
    getDefaultValue: jest.fn().mockReturnValue(null),
    validateValue: jest.fn().mockReturnValue(null),
    formatValue: jest.fn().mockImplementation((v: unknown) => v),
  };

  const mockTypeRegistry = {
    resolveHandlerAndConfig: jest.fn().mockReturnValue({ handler: mockHandler, config: {} }),
  } as unknown as jest.Mocked<PropertyTypeRegistry>;

  const mockFormulaRecalculator = {
    recalculate: jest.fn(),
  } as unknown as jest.Mocked<FormulaRecalculator>;

  const mockPvRepo = {
    findById: jest.fn(),
    findAllByRecord: jest.fn(),
    findByRecordAndProperty: jest.fn(),
    upsert: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    transaction: jest.fn(),
  } as unknown as jest.Mocked<PropertyValueRepository>;

  const mockRecordRepo = {
    findByIdWithOwner: jest.fn(),
  } as unknown as jest.Mocked<RecordRepository>;

  const mockPropertyRepo = {
    findById: jest.fn(),
  } as unknown as jest.Mocked<PropertyRepository>;

  const record = { id: "r-1", databaseId: "db-1" };
  const property = { id: "p-1", databaseId: "db-1", type: "TEXT", config: {} };
  const propertyValue = { id: "propertyValue-1", recordId: "r-1", propertyId: "p-1", value: "hello", property };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PropertyValueService,
        { provide: AppLogger, useValue: mockLogger },
        { provide: EventEmitter2, useValue: mockEventEmitter },
        { provide: PropertyTypeRegistry, useValue: mockTypeRegistry },
        { provide: FormulaRecalculator, useValue: mockFormulaRecalculator },
        { provide: PropertyValueRepository, useValue: mockPvRepo },
        { provide: RecordRepository, useValue: mockRecordRepo },
        { provide: PropertyRepository, useValue: mockPropertyRepo },
      ],
    }).compile();

    service = module.get<PropertyValueService>(PropertyValueService);
    jest.clearAllMocks();

    mockPvRepo.transaction.mockImplementation(async (cb: (tx: any) => Promise<any>) => cb({}));
    mockFormulaRecalculator.recalculate.mockResolvedValue(undefined as any);
    mockEventEmitter.emitAsync.mockResolvedValue([] as any);
  });

  describe("create", () => {
    it("TC-PROPVAL-U-001: should throw NotFoundException when record not found", async () => {
      mockRecordRepo.findByIdWithOwner.mockResolvedValue(null as any);

      await expect(service.create("r-1", { propertyId: "p-1", value: "x" }, "u-1")).rejects.toThrow(NotFoundException);
      expect(mockPropertyRepo.findById).not.toHaveBeenCalled();
    });

    it("TC-PROPVAL-U-002: should throw NotFoundException when property not found", async () => {
      mockRecordRepo.findByIdWithOwner.mockResolvedValue(record as any);
      mockPropertyRepo.findById.mockResolvedValue(null as any);

      await expect(service.create("r-1", { propertyId: "p-99", value: "x" }, "u-1")).rejects.toThrow(NotFoundException);
    });

    it("TC-PROPVAL-U-003: should throw ConflictException when property belongs to different database", async () => {
      mockRecordRepo.findByIdWithOwner.mockResolvedValue(record as any);
      mockPropertyRepo.findById.mockResolvedValue({ ...property, databaseId: "db-OTHER" } as any);

      await expect(service.create("r-1", { propertyId: "p-1", value: "x" }, "u-1")).rejects.toThrow(ConflictException);
    });

    it("TC-PROPVAL-U-004: should throw BadRequestException when value is invalid", async () => {
      mockRecordRepo.findByIdWithOwner.mockResolvedValue(record as any);
      mockPropertyRepo.findById.mockResolvedValue(property as any);
      mockHandler.validateValue.mockReturnValue(["value must be a string"]);
      mockPvRepo.findByRecordAndProperty.mockResolvedValue(null as any);

      await expect(service.create("r-1", { propertyId: "p-1", value: 123 }, "u-1")).rejects.toThrow(BadRequestException);
    });

    it("TC-PROPVAL-U-005: should create property value and emit automation event", async () => {
      mockRecordRepo.findByIdWithOwner.mockResolvedValue(record as any);
      mockPropertyRepo.findById.mockResolvedValue(property as any);
      mockHandler.validateValue.mockReturnValue(null);
      mockPvRepo.findByRecordAndProperty.mockResolvedValue(null as any);
      mockPvRepo.upsert.mockResolvedValue(propertyValue as any);

      const result = await service.create("r-1", { propertyId: "p-1", value: "hello" }, "u-1");

      expect(result.id).toBe("propertyValue-1");
      expect(mockEventEmitter.emitAsync).toHaveBeenCalledWith("automation.fieldChanged", expect.objectContaining({ recordId: "r-1" }));
    });

    it("TC-PROPVAL-U-006: should skip automation event when skipAutomations is true", async () => {
      mockRecordRepo.findByIdWithOwner.mockResolvedValue(record as any);
      mockPropertyRepo.findById.mockResolvedValue(property as any);
      mockHandler.validateValue.mockReturnValue(null);
      mockPvRepo.findByRecordAndProperty.mockResolvedValue(null as any);
      mockPvRepo.upsert.mockResolvedValue(propertyValue as any);

      await service.create("r-1", { propertyId: "p-1", value: "hello" }, "u-1", { skipAutomations: true });

      expect(mockEventEmitter.emitAsync).not.toHaveBeenCalled();
    });
  });

  describe("findAll", () => {
    it("TC-PROPVAL-U-007: should return all property value DTOs for record", async () => {
      mockPvRepo.findAllByRecord.mockResolvedValue([propertyValue] as any);

      const result = await service.findAll("r-1", "u-1");

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe("propertyValue-1");
      expect(mockPvRepo.findAllByRecord).toHaveBeenCalledWith("r-1", "u-1");
    });
  });

  describe("findOne", () => {
    it("TC-PROPVAL-U-008: should throw NotFoundException when property value not found", async () => {
      mockPvRepo.findById.mockResolvedValue(null as any);

      await expect(service.findOne("propertyValue-999")).rejects.toThrow(NotFoundException);
    });

    it("TC-PROPVAL-U-009: should return property value DTO", async () => {
      mockPvRepo.findById.mockResolvedValue(propertyValue as any);

      const result = await service.findOne("propertyValue-1");

      expect(result.id).toBe("propertyValue-1");
    });
  });

  describe("update", () => {
    it("TC-PROPVAL-U-010: should throw NotFoundException when property value not found", async () => {
      mockPvRepo.findById.mockResolvedValue(null as any);

      await expect(service.update("propertyValue-999", { value: "new" })).rejects.toThrow(NotFoundException);
    });

    it("TC-PROPVAL-U-011: should throw BadRequestException when new value is invalid", async () => {
      mockPvRepo.findById.mockResolvedValue(propertyValue as any);
      mockHandler.validateValue.mockReturnValue(["invalid"]);

      await expect(service.update("propertyValue-1", { value: 999 })).rejects.toThrow(BadRequestException);
    });

    it("TC-PROPVAL-U-012: should update property value and trigger formula recalculation", async () => {
      const updated = { ...propertyValue, value: "world" };
      mockPvRepo.findById.mockResolvedValue(propertyValue as any);
      mockHandler.validateValue.mockReturnValue(null);
      mockPvRepo.update.mockResolvedValue(updated as any);

      const result = await service.update("propertyValue-1", { value: "world" }, "u-1");

      expect(result.value).toBe("world");
      expect(mockFormulaRecalculator.recalculate).toHaveBeenCalled();
    });

    it("TC-PROPVAL-U-013: should emit automation event when userId provided", async () => {
      const updated = { ...propertyValue, value: "world" };
      mockPvRepo.findById.mockResolvedValue(propertyValue as any);
      mockHandler.validateValue.mockReturnValue(null);
      mockPvRepo.update.mockResolvedValue(updated as any);

      await service.update("propertyValue-1", { value: "world" }, "u-1");

      expect(mockEventEmitter.emitAsync).toHaveBeenCalledWith("automation.fieldChanged", expect.objectContaining({ userId: "u-1" }));
    });

    it("TC-PROPVAL-U-014: should not emit automation event when userId is absent", async () => {
      const updated = { ...propertyValue, value: "world" };
      mockPvRepo.findById.mockResolvedValue(propertyValue as any);
      mockHandler.validateValue.mockReturnValue(null);
      mockPvRepo.update.mockResolvedValue(updated as any);

      await service.update("propertyValue-1", { value: "world" });

      expect(mockEventEmitter.emitAsync).not.toHaveBeenCalled();
    });
  });

  describe("remove", () => {
    it("TC-PROPVAL-U-015: should throw NotFoundException when property value not found", async () => {
      mockPvRepo.findById.mockResolvedValue(null as any);

      await expect(service.remove("propertyValue-999")).rejects.toThrow(NotFoundException);
    });

    it("TC-PROPVAL-U-016: should delete property value and trigger formula recalculation", async () => {
      mockPvRepo.findById.mockResolvedValue(propertyValue as any);
      mockPvRepo.delete.mockResolvedValue(propertyValue as any);

      const result = await service.remove("propertyValue-1");

      expect(result.id).toBe("propertyValue-1");
      expect(mockFormulaRecalculator.recalculate).toHaveBeenCalled();
      expect(mockPvRepo.delete).toHaveBeenCalledWith("propertyValue-1", expect.anything());
    });
  });
});
