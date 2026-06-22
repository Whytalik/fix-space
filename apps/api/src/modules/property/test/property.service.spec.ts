import { BadRequestException, ConflictException, ForbiddenException, NotFoundException } from "@nestjs/common";
import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import type { TestingModule } from "@nestjs/testing";
import { Test } from "@nestjs/testing";
import { PropertyType } from "@fixspace/domain";
import { AppLogger } from "@/common/logger/app-logger.service";
import { PropertyTypeRegistry } from "../types";
import { FormulaRecalculator } from "../types/formula/formula-recalculator.service";
import { FormulaEngine } from "../types/formula/formula-engine.service";
import { PropertyService } from "../property.service";
import { PropertyRepository } from "../repositories/property.repository";
import { PropertyGroupRepository } from "@/modules/property-group/repositories/property-group.repository";
import { ViewRepository } from "@/modules/view/repositories/view.repository";
import { DatabaseRepository } from "@/modules/database/repositories/database.repository";

describe("PropertyService", () => {
  let service: PropertyService;

  const mockLogger = {
    setContext: jest.fn(),
    debug: jest.fn(),
    log: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  } as unknown as jest.Mocked<AppLogger>;

  const mockConfigHandler = {
    getDefaultConfig: jest.fn().mockReturnValue({}),
    validateConfig: jest.fn().mockReturnValue(null),
  };

  const mockValueHandler = {
    convertFrom: jest.fn().mockReturnValue(null),
  };

  const mockTypeRegistry = {
    getConfigHandler: jest.fn().mockReturnValue(mockConfigHandler),
    getValueHandler: jest.fn().mockReturnValue(mockValueHandler),
  } as unknown as jest.Mocked<PropertyTypeRegistry>;

  const mockFormulaRecalculator = {
    recalculate: jest.fn(),
    previewForDatabase: jest.fn(),
  } as unknown as jest.Mocked<FormulaRecalculator>;

  const mockFormulaEngine = {
    evaluate: jest.fn(),
  } as unknown as jest.Mocked<FormulaEngine>;

  const mockPropertyRepo = {
    findById: jest.fn(),
    findByNameInDatabase: jest.fn(),
    findByIdWithOwner: jest.fn(),
    findByNameExcluding: jest.fn(),
    findAllByDatabase: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    transaction: jest.fn(),
  } as unknown as jest.Mocked<PropertyRepository>;

  const mockPropertyGroupRepo = {
    findById: jest.fn(),
    findAllByDatabase: jest.fn().mockResolvedValue([]),
    create: jest.fn().mockResolvedValue({ id: "group-general-1", name: "General", databaseId: "db-1" }),
  } as unknown as jest.Mocked<PropertyGroupRepository>;

  const mockViewRepo = {
    findAllByDatabase: jest.fn(),
  } as unknown as jest.Mocked<ViewRepository>;

  const mockDatabaseRepo = {
    findDatabaseByOwner: jest.fn(),
    exists: jest.fn(),
  } as unknown as jest.Mocked<DatabaseRepository>;

  const database = { id: "db-1", isLocked: false };
  const property = {
    id: "p-1",
    databaseId: "db-1",
    name: "Status",
    type: PropertyType.TEXT,
    config: {},
    isProtected: false,
    position: 1,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PropertyService,
        { provide: AppLogger, useValue: mockLogger },
        { provide: PropertyTypeRegistry, useValue: mockTypeRegistry },
        { provide: FormulaRecalculator, useValue: mockFormulaRecalculator },
        { provide: FormulaEngine, useValue: mockFormulaEngine },
        { provide: PropertyRepository, useValue: mockPropertyRepo },
        { provide: PropertyGroupRepository, useValue: mockPropertyGroupRepo },
        { provide: ViewRepository, useValue: mockViewRepo },
        { provide: DatabaseRepository, useValue: mockDatabaseRepo },
      ],
    }).compile();

    service = module.get<PropertyService>(PropertyService);
    jest.clearAllMocks();

    mockPropertyRepo.transaction.mockImplementation(async (cb: (tx: any) => Promise<any>) => {
      const mockTx = {
        record: { findMany: jest.fn().mockResolvedValue([]) },
        propertyValue: { createMany: jest.fn(), findMany: jest.fn().mockResolvedValue([]), update: jest.fn(), updateMany: jest.fn() },
        template: { findMany: jest.fn().mockResolvedValue([]) },
        templatePropertyValue: { createMany: jest.fn(), findMany: jest.fn().mockResolvedValue([]), update: jest.fn() },
      };
      return cb(mockTx);
    });

    mockFormulaRecalculator.recalculate.mockResolvedValue(undefined as any);
  });

  describe("create", () => {
    it("TC-PROP-U-019: should throw NotFoundException when database not found", async () => {
      mockDatabaseRepo.findDatabaseByOwner.mockResolvedValue(null as any);

      await expect(service.create("db-1", { name: "Notes", type: PropertyType.TEXT }, "u-1")).rejects.toThrow(NotFoundException);
    });

    it("TC-PROP-U-020: should throw ForbiddenException when database is locked", async () => {
      mockDatabaseRepo.findDatabaseByOwner.mockResolvedValue({ ...database, isLocked: true } as any);

      await expect(service.create("db-1", { name: "Notes", type: PropertyType.TEXT }, "u-1")).rejects.toThrow(ForbiddenException);
    });

    it("TC-PROP-U-021: should throw ConflictException when property name already exists", async () => {
      mockDatabaseRepo.findDatabaseByOwner.mockResolvedValue(database as any);
      mockPropertyRepo.findByNameInDatabase.mockResolvedValue(property as any);

      await expect(service.create("db-1", { name: "Status", type: PropertyType.TEXT }, "u-1")).rejects.toThrow(ConflictException);
    });

    it("TC-PROP-U-022: should throw BadRequestException when config is invalid", async () => {
      mockDatabaseRepo.findDatabaseByOwner.mockResolvedValue(database as any);
      mockPropertyRepo.findByNameInDatabase.mockResolvedValue(null as any);
      mockConfigHandler.validateConfig.mockReturnValue(["format is required"]);

      await expect(service.create("db-1", { name: "Notes", type: PropertyType.TEXT, config: {} }, "u-1")).rejects.toThrow(
        BadRequestException,
      );
    });

    it("TC-PROP-U-023: should create and return property DTO", async () => {
      mockDatabaseRepo.findDatabaseByOwner.mockResolvedValue(database as any);
      mockPropertyRepo.findByNameInDatabase.mockResolvedValue(null as any);
      mockConfigHandler.validateConfig.mockReturnValue(null);
      mockPropertyRepo.create.mockResolvedValue(property as any);

      const result = await service.create("db-1", { name: "Status", type: PropertyType.TEXT }, "u-1");

      expect(result.id).toBe("p-1");
      expect(mockPropertyRepo.create).toHaveBeenCalled();
    });
  });

  describe("findAll", () => {
    it("TC-PROP-U-024: should return all properties with broken relation flags resolved", async () => {
      const relProp = { ...property, type: PropertyType.RELATION, config: { relatedEntityId: "db-other", multiple: false } };
      mockPropertyRepo.findAllByDatabase.mockResolvedValue([relProp] as any);
      mockDatabaseRepo.exists.mockResolvedValue(false as any);

      const result = await service.findAll("db-1", "u-1");

      expect(result).toHaveLength(1);
      expect((result[0].config as any).isBroken).toBe(true);
    });
  });

  describe("findOne", () => {
    it("TC-PROP-U-025: should throw NotFoundException when property not found", async () => {
      mockPropertyRepo.findByIdWithOwner.mockResolvedValue(null as any);

      await expect(service.findOne("p-999", "u-1")).rejects.toThrow(NotFoundException);
    });

    it("TC-PROP-U-026: should return property DTO", async () => {
      mockPropertyRepo.findByIdWithOwner.mockResolvedValue(property as any);

      const result = await service.findOne("p-1", "u-1");

      expect(result.id).toBe("p-1");
    });
  });

  describe("update", () => {
    it("TC-PROP-U-027: should throw NotFoundException when property not found", async () => {
      mockPropertyRepo.findByIdWithOwner.mockResolvedValue(null as any);

      await expect(service.update("p-999", { name: "Changed" }, "u-1")).rejects.toThrow(NotFoundException);
    });

    it("TC-PROP-U-028: should throw ForbiddenException when database is locked", async () => {
      mockPropertyRepo.findByIdWithOwner.mockResolvedValue(property as any);
      mockDatabaseRepo.findDatabaseByOwner.mockResolvedValue({ ...database, isLocked: true } as any);

      await expect(service.update("p-1", { name: "Changed" }, "u-1")).rejects.toThrow(ForbiddenException);
    });

    it("TC-PROP-U-029: should throw ForbiddenException when renaming protected Name property", async () => {
      const nameProperty = { ...property, name: "Name" };
      mockPropertyRepo.findByIdWithOwner.mockResolvedValue(nameProperty as any);
      mockDatabaseRepo.findDatabaseByOwner.mockResolvedValue(database as any);

      await expect(service.update("p-1", { name: "Renamed" }, "u-1")).rejects.toThrow(ForbiddenException);
    });

    it("TC-PROP-U-030: should throw ConflictException when new name is already taken", async () => {
      mockPropertyRepo.findByIdWithOwner.mockResolvedValue(property as any);
      mockDatabaseRepo.findDatabaseByOwner.mockResolvedValue(database as any);
      mockPropertyRepo.findByNameExcluding.mockResolvedValue({ id: "p-other" } as any);

      await expect(service.update("p-1", { name: "OtherName" }, "u-1")).rejects.toThrow(ConflictException);
    });

    it("TC-PROP-U-031: should update and return property DTO", async () => {
      const updated = { ...property, name: "Updated" };
      mockPropertyRepo.findByIdWithOwner.mockResolvedValue(property as any);
      mockDatabaseRepo.findDatabaseByOwner.mockResolvedValue(database as any);
      mockPropertyRepo.findByNameExcluding.mockResolvedValue(null as any);
      mockPropertyRepo.update.mockResolvedValue(updated as any);

      const result = await service.update("p-1", { name: "Updated" }, "u-1");

      expect(result.name).toBe("Updated");
    });
  });

  describe("remove", () => {
    it("TC-PROP-U-032: should throw NotFoundException when property not found", async () => {
      mockPropertyRepo.findByIdWithOwner.mockResolvedValue(null as any);

      await expect(service.remove("p-999", "u-1")).rejects.toThrow(NotFoundException);
    });

    it("TC-PROP-U-033: should throw ForbiddenException when removing protected Name property", async () => {
      const nameProperty = { ...property, name: "Name" };
      mockPropertyRepo.findByIdWithOwner.mockResolvedValue(nameProperty as any);

      await expect(service.remove("p-1", "u-1")).rejects.toThrow(ForbiddenException);
    });

    it("TC-PROP-U-034: should throw ForbiddenException when removing isProtected property", async () => {
      const protectedProperty = { ...property, isProtected: true };
      mockPropertyRepo.findByIdWithOwner.mockResolvedValue(protectedProperty as any);

      await expect(service.remove("p-1", "u-1")).rejects.toThrow(ForbiddenException);
    });

    it("TC-PROP-U-035: should delete property", async () => {
      mockPropertyRepo.findByIdWithOwner.mockResolvedValue(property as any);
      mockPropertyRepo.delete.mockResolvedValue(undefined as any);

      await service.remove("p-1", "u-1");

      expect(mockPropertyRepo.delete).toHaveBeenCalledWith("p-1");
    });
  });

  describe("previewFormula", () => {
    it("TC-PROP-U-036: should evaluate formula and return result", () => {
      mockFormulaEngine.evaluate.mockReturnValue(42 as any);

      const result = service.previewFormula("p-1", {} as any, { fieldA: 10, fieldB: 32 });

      expect(result.result).toBe(42);
      expect(mockFormulaEngine.evaluate).toHaveBeenCalledWith({}, { field_fieldA: 10, field_fieldB: 32 });
    });
  });

  describe("duplicate", () => {
    it("TC-PROP-U-037: should throw NotFoundException when property not found", async () => {
      mockPropertyRepo.findByIdWithOwner.mockResolvedValue(null as any);

      await expect(service.duplicate("p-999", "u-1")).rejects.toThrow(NotFoundException);
    });

    it("TC-PROP-U-038: should throw ForbiddenException when database is locked", async () => {
      mockPropertyRepo.findByIdWithOwner.mockResolvedValue(property as any);
      mockDatabaseRepo.findDatabaseByOwner.mockResolvedValue({ ...database, isLocked: true } as any);

      await expect(service.duplicate("p-1", "u-1")).rejects.toThrow(ForbiddenException);
    });

    it("TC-PROP-U-039: should create duplicate with '(copy)' suffix", async () => {
      const duplicated = { ...property, id: "p-2", name: "Status (copy)", position: 2 };
      mockPropertyRepo.findByIdWithOwner.mockResolvedValue(property as any);
      mockDatabaseRepo.findDatabaseByOwner.mockResolvedValue(database as any);
      mockPropertyRepo.create.mockResolvedValue(duplicated as any);

      const result = await service.duplicate("p-1", "u-1");

      expect(result.name).toBe("Status (copy)");
      expect(mockPropertyRepo.create).toHaveBeenCalledWith(expect.objectContaining({ name: "Status (copy)" }), expect.anything());
    });
  });
});
