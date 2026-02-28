import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { NotFoundException } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { prisma } from "@nucleus/database";
import { AppLogger } from "../../common/logger/app-logger.service";
import { RecordService } from "../record.service";

jest.mock("@nucleus/database", () => ({
  prisma: {
    database: {
      findFirst: jest.fn(),
    },
    property: {
      findMany: jest.fn(),
    },
    record: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    propertyValue: {
      create: jest.fn(),
    },
    $transaction: jest.fn(),
  },
}));

describe("RecordService", () => {
  let service: RecordService;

  const mockLogger = {
    setContext: jest.fn(),
    debug: jest.fn(),
    log: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  };

  const mockDatabase = {
    id: "db-123",
    spaceId: "space-123",
    name: "Test Database",
  };

  const mockProperty1 = {
    id: "prop-1",
    databaseId: "db-123",
    name: "Title",
    type: "text",
  };
  const mockProperty2 = {
    id: "prop-2",
    databaseId: "db-123",
    name: "Status",
    type: "status",
  };

  const mockRecord = {
    id: "record-123",
    databaseId: "db-123",
    name: "Test Record",
    icon: "📝",
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
    config: null,
  };

  const mockRecordWithIncludes = {
    ...mockRecord,
    values: [],
    content: null,
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RecordService,
        {
          provide: AppLogger,
          useValue: mockLogger,
        },
      ],
    }).compile();

    service = module.get<RecordService>(RecordService);
  });

  describe("create", () => {
    it("should create a record with property values and return RecordResponseDto", async () => {
      (prisma.database.findFirst as jest.Mock).mockResolvedValue(mockDatabase);
      (prisma.property.findMany as jest.Mock).mockResolvedValue([mockProperty1, mockProperty2]);

      const mockPv1 = {
        id: "pv-1",
        recordId: "record-123",
        propertyId: "prop-1",
        value: null,
        computed: false,
      };
      const mockPv2 = {
        id: "pv-2",
        recordId: "record-123",
        propertyId: "prop-2",
        value: null,
        computed: false,
      };

      const mockTx = {
        record: {
          create: jest.fn<() => Promise<typeof mockRecord>>().mockResolvedValue(mockRecord),
          findUnique: jest.fn<() => Promise<typeof mockRecordWithIncludes>>().mockResolvedValue(mockRecordWithIncludes),
        },
        propertyValue: {
          create: jest
            .fn<() => Promise<typeof mockPv1>>()
            .mockResolvedValueOnce(mockPv1)
            .mockResolvedValueOnce(mockPv2),
        },
      };

      (prisma.$transaction as jest.Mock).mockImplementation(async (cb: (tx: typeof mockTx) => Promise<unknown>) =>
        cb(mockTx),
      );

      const result = await service.create(
        "db-123",
        {
          name: "Test Record",
          icon: "📝",
        },
        "user-123",
      );

      expect(result.id).toBe("record-123");
      expect(result.name).toBe("Test Record");
      expect(prisma.database.findFirst).toHaveBeenCalledWith({
        where: {
          id: "db-123",
          space: {
            ownerId: "user-123",
          },
        },
      });
      expect(prisma.property.findMany).toHaveBeenCalledWith({
        where: {
          databaseId: "db-123",
        },
      });
      expect(mockTx.record.create).toHaveBeenCalledTimes(1);
      expect(mockTx.propertyValue.create).toHaveBeenCalledTimes(2);
      expect(mockTx.propertyValue.create).toHaveBeenNthCalledWith(1, {
        data: {
          recordId: "record-123",
          propertyId: "prop-1",
          value: null,
          computed: false,
        },
      });
      expect(mockTx.propertyValue.create).toHaveBeenNthCalledWith(2, {
        data: {
          recordId: "record-123",
          propertyId: "prop-2",
          value: null,
          computed: false,
        },
      });
      expect(mockTx.record.findUnique).toHaveBeenCalledWith({
        where: {
          id: "record-123",
        },
        include: {
          values: true,
          content: true,
        },
      });
      expect(mockLogger.log).toHaveBeenCalledWith("Record created with property values", {
        recordId: "record-123",
        databaseId: "db-123",
        propertyCount: 2,
      });
    });

    it("should create record with no property values when database has no properties", async () => {
      (prisma.database.findFirst as jest.Mock).mockResolvedValue(mockDatabase);
      (prisma.property.findMany as jest.Mock).mockResolvedValue([]);

      const mockTx = {
        record: {
          create: jest.fn<() => Promise<typeof mockRecord>>().mockResolvedValue(mockRecord),
          findUnique: jest.fn<() => Promise<typeof mockRecordWithIncludes>>().mockResolvedValue(mockRecordWithIncludes),
        },
        propertyValue: {
          create: jest.fn(),
        },
      };

      (prisma.$transaction as jest.Mock).mockImplementation(async (cb: (tx: typeof mockTx) => Promise<unknown>) =>
        cb(mockTx),
      );

      await service.create(
        "db-123",
        {
          name: "Test Record",
        },
        "user-123",
      );

      expect(mockTx.propertyValue.create).not.toHaveBeenCalled();
    });

    it("should throw NotFoundException when database not found or not owned by user", async () => {
      (prisma.database.findFirst as jest.Mock).mockResolvedValue(null);

      await expect(service.create("db-nonexistent", { name: "Test" }, "user-123")).rejects.toThrow(NotFoundException);
      await expect(service.create("db-nonexistent", { name: "Test" }, "user-123")).rejects.toThrow(
        "Database with id db-nonexistent not found",
      );
    });
  });

  describe("findAll", () => {
    it("should return array of RecordResponseDto for the database", async () => {
      const records = [
        mockRecordWithIncludes,
        {
          ...mockRecordWithIncludes,
          id: "record-456",
          name: "Record 2",
        },
      ];
      (prisma.record.findMany as jest.Mock).mockResolvedValue(records);

      const result = await service.findAll("db-123", "user-123");

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe("record-123");
      expect(result[1].id).toBe("record-456");
      expect(prisma.record.findMany).toHaveBeenCalledWith({
        where: {
          databaseId: "db-123",
          database: {
            space: {
              ownerId: "user-123",
            },
          },
        },
        include: {
          values: true,
          content: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      });
    });

    it("should return empty array when no records exist", async () => {
      (prisma.record.findMany as jest.Mock).mockResolvedValue([]);

      const result = await service.findAll("db-123", "user-123");

      expect(result).toEqual([]);
    });
  });

  describe("findOne", () => {
    it("should return RecordResponseDto for valid id", async () => {
      (prisma.record.findFirst as jest.Mock).mockResolvedValue(mockRecordWithIncludes);

      const result = await service.findOne("record-123", "user-123");

      expect(result.id).toBe("record-123");
      expect(result.name).toBe("Test Record");
      expect(prisma.record.findFirst).toHaveBeenCalledWith({
        where: {
          id: "record-123",
          database: {
            space: {
              ownerId: "user-123",
            },
          },
        },
        include: {
          values: true,
          content: true,
        },
      });
    });

    it("should throw NotFoundException when record not found", async () => {
      (prisma.record.findFirst as jest.Mock).mockResolvedValue(null);

      await expect(service.findOne("nonexistent", "user-123")).rejects.toThrow(NotFoundException);
      await expect(service.findOne("nonexistent", "user-123")).rejects.toThrow("Record with id nonexistent not found");
    });
  });

  describe("update", () => {
    it("should update record name and icon and return RecordResponseDto", async () => {
      const updatedRecord = {
        ...mockRecordWithIncludes,
        name: "Updated Record",
        icon: "🔥",
      };
      (prisma.record.findFirst as jest.Mock).mockResolvedValue(mockRecord);
      (prisma.record.update as jest.Mock).mockResolvedValue(updatedRecord);

      const result = await service.update(
        "record-123",
        {
          name: "Updated Record",
          icon: "🔥",
        },
        "user-123",
      );

      expect(result.name).toBe("Updated Record");
      expect(result.icon).toBe("🔥");
      expect(prisma.record.findFirst).toHaveBeenCalledWith({
        where: {
          id: "record-123",
          database: {
            space: {
              ownerId: "user-123",
            },
          },
        },
      });
      expect(prisma.record.update).toHaveBeenCalledWith({
        where: {
          id: "record-123",
        },
        data: {
          name: "Updated Record",
          icon: "🔥",
        },
        include: {
          values: true,
          content: true,
        },
      });
      expect(mockLogger.log).toHaveBeenCalledWith("Record updated", { id: "record-123" });
    });

    it("should throw NotFoundException when record not found", async () => {
      (prisma.record.findFirst as jest.Mock).mockResolvedValue(null);

      await expect(service.update("nonexistent", { name: "Updated" }, "user-123")).rejects.toThrow(NotFoundException);
      await expect(service.update("nonexistent", { name: "Updated" }, "user-123")).rejects.toThrow(
        "Record with id nonexistent not found",
      );
    });
  });

  describe("remove", () => {
    it("should delete record and return RecordResponseDto", async () => {
      (prisma.record.findFirst as jest.Mock).mockResolvedValue(mockRecord);
      (prisma.record.delete as jest.Mock).mockResolvedValue(mockRecord);

      const result = await service.remove("record-123", "user-123");

      expect(result.id).toBe("record-123");
      expect(prisma.record.findFirst).toHaveBeenCalledWith({
        where: {
          id: "record-123",
          database: {
            space: {
              ownerId: "user-123",
            },
          },
        },
      });
      expect(prisma.record.delete).toHaveBeenCalledWith({
        where: {
          id: "record-123",
        },
      });
      expect(mockLogger.log).toHaveBeenCalledWith("Record removed", { id: "record-123" });
    });

    it("should throw NotFoundException when record not found", async () => {
      (prisma.record.findFirst as jest.Mock).mockResolvedValue(null);

      await expect(service.remove("nonexistent", "user-123")).rejects.toThrow(NotFoundException);
      await expect(service.remove("nonexistent", "user-123")).rejects.toThrow("Record with id nonexistent not found");
    });
  });
});
