import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { BadRequestException, NotFoundException } from "@nestjs/common";
import type { TestingModule } from "@nestjs/testing";
import { Test } from "@nestjs/testing";
import { Prisma } from "@nucleus/database";
import { AppLogger } from "../../common/logger/app-logger.service";
import { RecordRepository } from "../record.repository";
import { RecordService } from "../record.service";

describe("RecordService", () => {
  let service: RecordService;

  const mockLogger = {
    setContext: jest.fn<any>(),
    debug: jest.fn<any>(),
    log: jest.fn<any>(),
    warn: jest.fn<any>(),
    error: jest.fn<any>(),
  };

  const mockRecordRepo = {
    findDatabaseByOwner: jest.fn<any>(),
    findPropertiesByDatabase: jest.fn<any>(),
    findTemplateById: jest.fn<any>(),
    findDefaultTemplate: jest.fn<any>(),
    findByIdWithOwner: jest.fn<any>(),
    findByIdForOwnerCheck: jest.fn<any>(),
    findAllByDatabase: jest.fn<any>(),
    findPagedByDatabase: jest.fn<any>(),
    create: jest.fn<any>(),
    findUniqueOrThrowWithValues: jest.fn<any>(),
    update: jest.fn<any>(),
    delete: jest.fn<any>(),
    transaction: jest.fn<any>(),
  };

  const mockDatabase = { id: "db-123" };

  const mockProperty1 = { id: "prop-1", databaseId: "db-123", name: "Title", type: "text" };
  const mockProperty2 = { id: "prop-2", databaseId: "db-123", name: "Status", type: "status" };

  const mockRecord = {
    id: "record-123",
    databaseId: "db-123",
    name: "Test Record",
    icon: "📝",
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
    config: null,
  };

  const mockRecordWithIncludes = { ...mockRecord, values: [], content: null };

  let fakeTx: { propertyValue: { create: ReturnType<typeof jest.fn> } };

  beforeEach(async () => {
    jest.clearAllMocks();

    fakeTx = { propertyValue: { create: jest.fn<any>().mockResolvedValue({}) } };
    mockRecordRepo.transaction.mockImplementation(
      async (cb: (tx: typeof fakeTx) => Promise<unknown>) => cb(fakeTx),
    );

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RecordService,
        { provide: AppLogger, useValue: mockLogger },
        { provide: RecordRepository, useValue: mockRecordRepo },
      ],
    }).compile();

    service = module.get<RecordService>(RecordService);
  });

  describe("create", () => {
    it("should create a record with property values and return RecordResponseDto", async () => {
      mockRecordRepo.findDatabaseByOwner.mockResolvedValue(mockDatabase);
      mockRecordRepo.findPropertiesByDatabase.mockResolvedValue([mockProperty1, mockProperty2]);
      mockRecordRepo.findDefaultTemplate.mockResolvedValue(null);
      mockRecordRepo.create.mockResolvedValue(mockRecord);
      mockRecordRepo.findUniqueOrThrowWithValues.mockResolvedValue(mockRecordWithIncludes);

      const result = await service.create(
        "db-123",
        { databaseId: "db-123", name: "Test Record", icon: "📝" },
        "user-123",
      );

      expect(result.id).toBe("record-123");
      expect(result.name).toBe("Test Record");
      expect(mockRecordRepo.findDatabaseByOwner).toHaveBeenCalledWith("db-123", "user-123");
      expect(mockRecordRepo.findPropertiesByDatabase).toHaveBeenCalledWith("db-123");
      expect(mockRecordRepo.create).toHaveBeenCalledTimes(1);
      expect(fakeTx.propertyValue.create).toHaveBeenCalledTimes(2);
      expect(fakeTx.propertyValue.create).toHaveBeenNthCalledWith(1, {
        data: { recordId: "record-123", propertyId: "prop-1", value: Prisma.DbNull, computed: false },
      });
      expect(fakeTx.propertyValue.create).toHaveBeenNthCalledWith(2, {
        data: { recordId: "record-123", propertyId: "prop-2", value: Prisma.DbNull, computed: false },
      });
      expect(mockLogger.log).toHaveBeenCalledWith("Record created with property values", {
        recordId: "record-123",
        databaseId: "db-123",
        templateId: null,
        propertyCount: 2,
      });
    });

    it("should create record with no property values when database has no properties", async () => {
      mockRecordRepo.findDatabaseByOwner.mockResolvedValue(mockDatabase);
      mockRecordRepo.findPropertiesByDatabase.mockResolvedValue([]);
      mockRecordRepo.findDefaultTemplate.mockResolvedValue(null);
      mockRecordRepo.create.mockResolvedValue(mockRecord);
      mockRecordRepo.findUniqueOrThrowWithValues.mockResolvedValue(mockRecordWithIncludes);

      await service.create("db-123", { databaseId: "db-123", name: "Test Record" }, "user-123");

      expect(fakeTx.propertyValue.create).not.toHaveBeenCalled();
    });

    it("should throw NotFoundException when database not found", async () => {
      mockRecordRepo.findDatabaseByOwner.mockResolvedValue(null);

      await expect(
        service.create("db-nonexistent", { databaseId: "db-nonexistent", name: "Test" }, "user-123"),
      ).rejects.toThrow(NotFoundException);
      await expect(
        service.create("db-nonexistent", { databaseId: "db-nonexistent", name: "Test" }, "user-123"),
      ).rejects.toThrow("Database with id db-nonexistent not found");
    });

    it("should copy name, icon, and property values from explicit templateId", async () => {
      const mockTemplate = {
        id: "tmpl-1",
        name: "Quick Trade",
        icon: "📈",
        values: [
          { propertyId: "prop-1", value: "Long" },
          { propertyId: "prop-2", value: null },
        ],
      };

      mockRecordRepo.findDatabaseByOwner.mockResolvedValue(mockDatabase);
      mockRecordRepo.findPropertiesByDatabase.mockResolvedValue([mockProperty1, mockProperty2]);
      mockRecordRepo.findTemplateById.mockResolvedValue(mockTemplate);
      mockRecordRepo.create.mockResolvedValue({ ...mockRecord, name: "Quick Trade", icon: "📈", templateId: "tmpl-1" });
      mockRecordRepo.findUniqueOrThrowWithValues.mockResolvedValue({
        ...mockRecordWithIncludes,
        name: "Quick Trade",
        icon: "📈",
      });

      const result = await service.create("db-123", { databaseId: "db-123", templateId: "tmpl-1" }, "user-123");

      expect(result.name).toBe("Quick Trade");
      expect(result.icon).toBe("📈");
      expect(mockRecordRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({ templateId: "tmpl-1", name: "Quick Trade", icon: "📈" }),
        expect.anything(),
      );
      expect(fakeTx.propertyValue.create).toHaveBeenCalledTimes(2);
      expect(fakeTx.propertyValue.create).toHaveBeenNthCalledWith(1, {
        data: { recordId: expect.any(String), propertyId: "prop-1", value: "Long", computed: false },
      });
      expect(fakeTx.propertyValue.create).toHaveBeenNthCalledWith(2, {
        data: { recordId: expect.any(String), propertyId: "prop-2", value: Prisma.DbNull, computed: false },
      });
    });

    it("should pick default template when templateId is not provided", async () => {
      const mockDefaultTemplate = {
        id: "tmpl-default",
        name: "Default Tmpl",
        icon: null,
        isDefault: true,
        values: [{ propertyId: "prop-1", value: "default-value" }],
      };

      mockRecordRepo.findDatabaseByOwner.mockResolvedValue(mockDatabase);
      mockRecordRepo.findPropertiesByDatabase.mockResolvedValue([mockProperty1]);
      mockRecordRepo.findDefaultTemplate.mockResolvedValue(mockDefaultTemplate);
      mockRecordRepo.create.mockResolvedValue({ ...mockRecord, name: "Default Tmpl", templateId: "tmpl-default" });
      mockRecordRepo.findUniqueOrThrowWithValues.mockResolvedValue({
        ...mockRecordWithIncludes,
        name: "Default Tmpl",
      });

      const result = await service.create("db-123", { databaseId: "db-123" }, "user-123");

      expect(result.name).toBe("Default Tmpl");
      expect(mockRecordRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({ templateId: "tmpl-default", name: "Default Tmpl" }),
        expect.anything(),
      );
      expect(fakeTx.propertyValue.create).toHaveBeenCalledWith({
        data: { recordId: expect.any(String), propertyId: "prop-1", value: "default-value", computed: false },
      });
    });
  });

  describe("findAll", () => {
    it("should return array of RecordResponseDto for the database", async () => {
      const records = [mockRecordWithIncludes, { ...mockRecordWithIncludes, id: "record-456", name: "Record 2" }];
      mockRecordRepo.findAllByDatabase.mockResolvedValue(records);

      const result = await service.findAll("db-123", "user-123");

      expect(result).toHaveLength(2);
      expect(result[0]!.id).toBe("record-123");
      expect(result[1]!.id).toBe("record-456");
      expect(mockRecordRepo.findAllByDatabase).toHaveBeenCalledWith("db-123", "user-123");
    });

    it("should return empty array when no records exist", async () => {
      mockRecordRepo.findAllByDatabase.mockResolvedValue([]);

      const result = await service.findAll("db-123", "user-123");

      expect(result).toEqual([]);
    });
  });

  describe("findOne", () => {
    it("should return RecordResponseDto for valid id", async () => {
      mockRecordRepo.findByIdWithOwner.mockResolvedValue(mockRecordWithIncludes);

      const result = await service.findOne("record-123", "user-123");

      expect(result.id).toBe("record-123");
      expect(result.name).toBe("Test Record");
      expect(mockRecordRepo.findByIdWithOwner).toHaveBeenCalledWith("record-123", "user-123");
    });

    it("should throw NotFoundException when record not found", async () => {
      mockRecordRepo.findByIdWithOwner.mockResolvedValue(null);

      await expect(service.findOne("nonexistent", "user-123")).rejects.toThrow(NotFoundException);
      await expect(service.findOne("nonexistent", "user-123")).rejects.toThrow("Record with id nonexistent not found");
    });
  });

  describe("update", () => {
    it("should update record name and icon and return RecordResponseDto", async () => {
      const updatedRecord = { ...mockRecordWithIncludes, name: "Updated Record", icon: "🔥" };
      mockRecordRepo.findByIdForOwnerCheck.mockResolvedValue(mockRecord);
      mockRecordRepo.update.mockResolvedValue(updatedRecord);

      const result = await service.update("record-123", { name: "Updated Record", icon: "🔥" }, "user-123");

      expect(result.name).toBe("Updated Record");
      expect(result.icon).toBe("🔥");
      expect(mockRecordRepo.findByIdForOwnerCheck).toHaveBeenCalledWith("record-123", "user-123");
      expect(mockRecordRepo.update).toHaveBeenCalledWith(
        "record-123",
        expect.objectContaining({ name: "Updated Record", icon: "🔥" }),
      );
      expect(mockLogger.log).toHaveBeenCalledWith("Record updated", { id: "record-123" });
    });

    it("should throw NotFoundException when record not found", async () => {
      mockRecordRepo.findByIdForOwnerCheck.mockResolvedValue(null);

      await expect(service.update("nonexistent", { name: "Updated" }, "user-123")).rejects.toThrow(NotFoundException);
      await expect(service.update("nonexistent", { name: "Updated" }, "user-123")).rejects.toThrow(
        "Record with id nonexistent not found",
      );
    });
  });

  describe("remove", () => {
    it("should delete record and return RecordResponseDto", async () => {
      mockRecordRepo.findByIdForOwnerCheck.mockResolvedValue(mockRecord);
      mockRecordRepo.delete.mockResolvedValue(mockRecord);

      const result = await service.remove("record-123", "user-123");

      expect(result.id).toBe("record-123");
      expect(mockRecordRepo.findByIdForOwnerCheck).toHaveBeenCalledWith("record-123", "user-123");
      expect(mockRecordRepo.delete).toHaveBeenCalledWith("record-123");
      expect(mockLogger.log).toHaveBeenCalledWith("Record removed", { id: "record-123" });
    });

    it("should throw NotFoundException when record not found", async () => {
      mockRecordRepo.findByIdForOwnerCheck.mockResolvedValue(null);

      await expect(service.remove("nonexistent", "user-123")).rejects.toThrow(NotFoundException);
      await expect(service.remove("nonexistent", "user-123")).rejects.toThrow("Record with id nonexistent not found");
    });
  });

  describe("findAllPaged", () => {
    it("should return {data, total, page, pageSize} with correct shape", async () => {
      mockRecordRepo.findPagedByDatabase.mockResolvedValue([[mockRecordWithIncludes], 1]);

      const result = await service.findAllPaged("db-123", "user-123", 1, 10);

      expect(result).toEqual({
        data: expect.any(Array),
        total: 1,
        page: 1,
        pageSize: 10,
      });
      expect(result.data).toHaveLength(1);
      expect(result.data[0]!.id).toBe("record-123");
    });

    it("should call findPagedByDatabase with skip and take computed from page and pageSize", async () => {
      mockRecordRepo.findPagedByDatabase.mockResolvedValue([[], 0]);

      await service.findAllPaged("db-123", "user-123", 3, 5);

      expect(mockRecordRepo.findPagedByDatabase).toHaveBeenCalledWith("db-123", "user-123", 10, 5);
    });

    it("should return correct total from repository", async () => {
      mockRecordRepo.findPagedByDatabase.mockResolvedValue([[], 42]);

      const result = await service.findAllPaged("db-123", "user-123", 2, 20);

      expect(result.total).toBe(42);
    });

    it("should throw BadRequestException when page < 1", async () => {
      await expect(service.findAllPaged("db-123", "user-123", 0, 10)).rejects.toThrow(BadRequestException);
    });

    it("should throw BadRequestException when pageSize < 1", async () => {
      await expect(service.findAllPaged("db-123", "user-123", 1, 0)).rejects.toThrow(BadRequestException);
    });
  });
});
