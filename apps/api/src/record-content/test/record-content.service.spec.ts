import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { NotFoundException } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { prisma } from "@nucleus/database";
import { AppLogger } from "../../common/logger/app-logger.service";
import { RecordContentService } from "../record-content.service";

jest.mock("@nucleus/database", () => ({
  prisma: {
    record: {
      findFirst: jest.fn(),
    },
    recordContent: {
      findUnique: jest.fn(),
      create: jest.fn(),
      upsert: jest.fn(),
      delete: jest.fn(),
    },
  },
}));

describe("RecordContentService", () => {
  let service: RecordContentService;

  const mockLogger = {
    setContext: jest.fn(),
    debug: jest.fn(),
    log: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  };

  const mockRecord = {
    id: "record-123",
    databaseId: "db-123",
    name: "Test Record",
  };

  const mockContent = {
    id: "content-123",
    recordId: "record-123",
    lastEditedAt: new Date("2024-01-01"),
    config: { version: 1 },
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RecordContentService,
        {
          provide: AppLogger,
          useValue: mockLogger,
        },
      ],
    }).compile();

    service = module.get<RecordContentService>(RecordContentService);
  });

  describe("findOrCreate", () => {
    it("should return existing content without creating a new one", async () => {
      (prisma.record.findFirst as jest.Mock).mockResolvedValue(mockRecord);
      (prisma.recordContent.findUnique as jest.Mock).mockResolvedValue(mockContent);

      const result = await service.findOrCreate("record-123", "user-123");

      expect(result.id).toBe("content-123");
      expect(result.recordId).toBe("record-123");
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
      expect(prisma.recordContent.findUnique).toHaveBeenCalledWith({
        where: {
          recordId: "record-123",
        },
      });
      expect(prisma.recordContent.create).not.toHaveBeenCalled();
    });

    it("should create content when it does not exist", async () => {
      (prisma.record.findFirst as jest.Mock).mockResolvedValue(mockRecord);
      (prisma.recordContent.findUnique as jest.Mock).mockResolvedValue(null);
      (prisma.recordContent.create as jest.Mock).mockResolvedValue(mockContent);

      const result = await service.findOrCreate("record-123", "user-123");

      expect(result.id).toBe("content-123");
      expect(prisma.recordContent.create).toHaveBeenCalledWith({
        data: {
          recordId: "record-123",
          config: {
            version: 1,
          },
        },
      });
      expect(mockLogger.log).toHaveBeenCalledWith("Record content created", {
        contentId: "content-123",
        recordId: "record-123",
      });
    });

    it("should throw NotFoundException when record not found", async () => {
      (prisma.record.findFirst as jest.Mock).mockResolvedValue(null);

      await expect(service.findOrCreate("record-nonexistent", "user-123")).rejects.toThrow(NotFoundException);
      await expect(service.findOrCreate("record-nonexistent", "user-123")).rejects.toThrow(
        "Record with id record-nonexistent not found",
      );
    });
  });

  describe("upsert", () => {
    it("should upsert content and return RecordContentResponseDto", async () => {
      const updatedContent = {
        ...mockContent,
        lastEditedAt: new Date("2024-06-01"),
      };
      (prisma.record.findFirst as jest.Mock).mockResolvedValue(mockRecord);
      (prisma.recordContent.upsert as jest.Mock).mockResolvedValue(updatedContent);

      const result = await service.upsert("record-123", {}, "user-123");

      expect(result.id).toBe("content-123");
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
      expect(prisma.recordContent.upsert).toHaveBeenCalledWith({
        where: {
          recordId: "record-123",
        },
        update: expect.objectContaining({
          lastEditedAt: expect.any(Date),
        }),
        create: {
          recordId: "record-123",
          config: {
            version: 1,
          },
        },
      });
      expect(mockLogger.log).toHaveBeenCalledWith("Record content upserted", {
        contentId: "content-123",
        recordId: "record-123",
      });
    });

    it("should throw NotFoundException when record not found", async () => {
      (prisma.record.findFirst as jest.Mock).mockResolvedValue(null);

      await expect(service.upsert("record-nonexistent", {}, "user-123")).rejects.toThrow(NotFoundException);
      await expect(service.upsert("record-nonexistent", {}, "user-123")).rejects.toThrow(
        "Record with id record-nonexistent not found",
      );
    });
  });

  describe("remove", () => {
    it("should delete content and return RecordContentResponseDto", async () => {
      (prisma.record.findFirst as jest.Mock).mockResolvedValue(mockRecord);
      (prisma.recordContent.findUnique as jest.Mock).mockResolvedValue(mockContent);
      (prisma.recordContent.delete as jest.Mock).mockResolvedValue(mockContent);

      const result = await service.remove("record-123", "user-123");

      expect(result.id).toBe("content-123");
      expect(prisma.recordContent.findUnique).toHaveBeenCalledWith({
        where: {
          recordId: "record-123",
        },
      });
      expect(prisma.recordContent.delete).toHaveBeenCalledWith({
        where: {
          recordId: "record-123",
        },
      });
      expect(mockLogger.log).toHaveBeenCalledWith("Record content removed", {
        recordId: "record-123",
      });
    });

    it("should throw NotFoundException when record not found", async () => {
      (prisma.record.findFirst as jest.Mock).mockResolvedValue(null);

      await expect(service.remove("record-nonexistent", "user-123")).rejects.toThrow(NotFoundException);
      await expect(service.remove("record-nonexistent", "user-123")).rejects.toThrow(
        "Record with id record-nonexistent not found",
      );
    });

    it("should throw NotFoundException when content not found", async () => {
      (prisma.record.findFirst as jest.Mock).mockResolvedValue(mockRecord);
      (prisma.recordContent.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.remove("record-123", "user-123")).rejects.toThrow(NotFoundException);
      await expect(service.remove("record-123", "user-123")).rejects.toThrow(
        "RecordContent for record record-123 not found",
      );
    });
  });
});
