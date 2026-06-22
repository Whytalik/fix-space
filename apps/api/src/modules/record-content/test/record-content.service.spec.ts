jest.mock("@fixspace/database");

import { NotFoundException } from "@nestjs/common";
import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import type { TestingModule } from "@nestjs/testing";
import { Test } from "@nestjs/testing";
import { AppLogger } from "@/common/logger/app-logger.service";
import { StorageService } from "@/core/storage/storage.service";
import { RecordContentService } from "../record-content.service";
import { RecordContentRepository } from "../repositories/record-content.repository";

describe("RecordContentService", () => {
  let service: RecordContentService;

  const mockLogger = {
    setContext: jest.fn(),
    debug: jest.fn(),
    log: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  } as unknown as jest.Mocked<AppLogger>;

  const mockRepo = {
    findByRecordId: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    findLastSnapshot: jest.fn(),
    countSnapshots: jest.fn(),
    deleteOldestSnapshot: jest.fn(),
    createSnapshot: jest.fn(),
    findSnapshotsByContentId: jest.fn(),
    findSnapshotById: jest.fn(),
    transaction: jest.fn(),
  } as unknown as jest.Mocked<RecordContentRepository>;

  const mockStorageService = {
    saveContentImage: jest.fn(),
  } as unknown as jest.Mocked<StorageService>;

  const baseContent = { id: "rc-1", recordId: "r-1", content: { rows: [] }, lastEditedAt: new Date() };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RecordContentService,
        { provide: AppLogger, useValue: mockLogger },
        { provide: RecordContentRepository, useValue: mockRepo },
        { provide: StorageService, useValue: mockStorageService },
      ],
    }).compile();

    service = module.get<RecordContentService>(RecordContentService);

    mockRepo.transaction.mockImplementation(async (cb: (tx: any) => Promise<any>) => cb({}));
  });

  describe("uploadImage", () => {
    it("TC-CONT-U-001: should upload image and return URL", async () => {
      mockStorageService.saveContentImage.mockResolvedValue("https://cdn.example.com/img.png" as any);

      const file = { originalname: "img.png", buffer: Buffer.from("data") } as Express.Multer.File;
      const result = await service.uploadImage("r-1", file);

      expect(result.url).toBe("https://cdn.example.com/img.png");
      expect(mockStorageService.saveContentImage).toHaveBeenCalledWith(file);
    });
  });

  describe("findByRecordId", () => {
    it("TC-CONT-U-002: should return empty content DTO when record has no content", async () => {
      mockRepo.findByRecordId.mockResolvedValue(null as any);

      const result = await service.findByRecordId("r-1");

      expect(result.recordId).toBe("r-1");
      expect(result.content).toEqual({ rows: [] });
    });

    it("TC-CONT-U-003: should return existing content DTO", async () => {
      mockRepo.findByRecordId.mockResolvedValue(baseContent as any);

      const result = await service.findByRecordId("r-1");

      expect(result.id).toBe("rc-1");
    });
  });

  describe("update", () => {
    it("TC-CONT-U-004: should create new content and snapshot when none exists", async () => {
      const created = { ...baseContent };
      mockRepo.findByRecordId.mockResolvedValueOnce(null as any);
      mockRepo.create.mockResolvedValue(created as any);
      mockRepo.countSnapshots.mockResolvedValue(0 as any);
      mockRepo.createSnapshot.mockResolvedValue(undefined as any);

      await service.update("r-1", { content: { rows: [] } });

      expect(mockRepo.create).toHaveBeenCalled();
      expect(mockRepo.createSnapshot).toHaveBeenCalled();
    });

    it("TC-CONT-U-005: should update existing content and create snapshot after interval", async () => {
      const oldDate = new Date(Date.now() - 10 * 60 * 1000);
      const lastSnapshot = { id: "s-1", createdAt: oldDate };
      mockRepo.findByRecordId.mockResolvedValueOnce(baseContent as any).mockResolvedValueOnce(baseContent as any);
      mockRepo.update.mockResolvedValue(undefined as any);
      mockRepo.findLastSnapshot.mockResolvedValue(lastSnapshot as any);
      mockRepo.countSnapshots.mockResolvedValue(3 as any);
      mockRepo.createSnapshot.mockResolvedValue(undefined as any);

      await service.update("r-1", { content: { rows: [] } });

      expect(mockRepo.update).toHaveBeenCalled();
      expect(mockRepo.createSnapshot).toHaveBeenCalled();
    });

    it("TC-CONT-U-006: should not create snapshot when within 5-min interval", async () => {
      const recentDate = new Date(Date.now() - 60 * 1000);
      const lastSnapshot = { id: "s-1", createdAt: recentDate };
      mockRepo.findByRecordId.mockResolvedValueOnce(baseContent as any).mockResolvedValueOnce(baseContent as any);
      mockRepo.update.mockResolvedValue(undefined as any);
      mockRepo.findLastSnapshot.mockResolvedValue(lastSnapshot as any);

      await service.update("r-1", { content: { rows: [] } });

      expect(mockRepo.createSnapshot).not.toHaveBeenCalled();
    });

    it("TC-CONT-U-007: should delete oldest snapshot when at 50 limit before creating new", async () => {
      const oldDate = new Date(Date.now() - 10 * 60 * 1000);
      mockRepo.findByRecordId.mockResolvedValueOnce(baseContent as any).mockResolvedValueOnce(baseContent as any);
      mockRepo.update.mockResolvedValue(undefined as any);
      mockRepo.findLastSnapshot.mockResolvedValue({ id: "s-old", createdAt: oldDate } as any);
      mockRepo.countSnapshots.mockResolvedValue(50 as any);
      mockRepo.deleteOldestSnapshot.mockResolvedValue(undefined as any);
      mockRepo.createSnapshot.mockResolvedValue(undefined as any);

      await service.update("r-1", { content: { rows: [] } });

      expect(mockRepo.deleteOldestSnapshot).toHaveBeenCalledWith("rc-1", expect.anything());
      expect(mockRepo.createSnapshot).toHaveBeenCalled();
    });

    it("TC-CONT-U-008: should force snapshot creation when forceSnapshot is true", async () => {
      const recentDate = new Date(Date.now() - 60 * 1000);
      mockRepo.findByRecordId.mockResolvedValueOnce(baseContent as any).mockResolvedValueOnce(baseContent as any);
      mockRepo.update.mockResolvedValue(undefined as any);
      mockRepo.findLastSnapshot.mockResolvedValue({ id: "s-1", createdAt: recentDate } as any);
      mockRepo.countSnapshots.mockResolvedValue(1 as any);
      mockRepo.createSnapshot.mockResolvedValue(undefined as any);

      await service.update("r-1", { content: { rows: [] }, forceSnapshot: true });

      expect(mockRepo.createSnapshot).toHaveBeenCalled();
    });
  });

  describe("getSnapshots", () => {
    it("TC-CONT-U-009: should return empty array when record has no content", async () => {
      mockRepo.findByRecordId.mockResolvedValue(null as any);

      const result = await service.getSnapshots("r-1");

      expect(result).toEqual([]);
    });

    it("TC-CONT-U-010: should return snapshot DTOs", async () => {
      const snapshot = { id: "s-1", recordContentId: "rc-1", content: { rows: [] }, createdAt: new Date() };
      mockRepo.findByRecordId.mockResolvedValue(baseContent as any);
      mockRepo.findSnapshotsByContentId.mockResolvedValue([snapshot] as any);

      const result = await service.getSnapshots("r-1");

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe("s-1");
    });
  });

  describe("restoreFromSnapshot", () => {
    it("TC-CONT-U-011: should throw NotFoundException when snapshot not found", async () => {
      mockRepo.findSnapshotById.mockResolvedValue(null as any);

      await expect(service.restoreFromSnapshot("r-1", "s-999")).rejects.toThrow(NotFoundException);
    });

    it("TC-CONT-U-012: should throw NotFoundException when record content not found", async () => {
      const snapshot = { id: "s-1", recordContentId: "rc-1", content: { rows: [] }, createdAt: new Date() };
      mockRepo.findSnapshotById.mockResolvedValue(snapshot as any);
      mockRepo.findByRecordId.mockResolvedValue(null as any);

      await expect(service.restoreFromSnapshot("r-1", "s-1")).rejects.toThrow(NotFoundException);
    });

    it("TC-CONT-U-013: should throw NotFoundException when snapshot belongs to different content", async () => {
      const snapshot = { id: "s-1", recordContentId: "rc-OTHER", content: { rows: [] }, createdAt: new Date() };
      mockRepo.findSnapshotById.mockResolvedValue(snapshot as any);
      mockRepo.findByRecordId.mockResolvedValue(baseContent as any);

      await expect(service.restoreFromSnapshot("r-1", "s-1")).rejects.toThrow(NotFoundException);
    });

    it("TC-CONT-U-014: should restore content from snapshot", async () => {
      const snapshot = { id: "s-1", recordContentId: "rc-1", content: { rows: [{ id: "row-1" }] }, createdAt: new Date() };
      const restoredContent = { ...baseContent, content: snapshot.content };
      mockRepo.findSnapshotById.mockResolvedValue(snapshot as any);
      mockRepo.findByRecordId.mockResolvedValueOnce(baseContent as any).mockResolvedValueOnce(restoredContent as any);
      mockRepo.update.mockResolvedValue(undefined as any);
      mockRepo.countSnapshots.mockResolvedValue(1 as any);
      mockRepo.createSnapshot.mockResolvedValue(undefined as any);

      const result = await service.restoreFromSnapshot("r-1", "s-1");

      expect(mockRepo.update).toHaveBeenCalledWith("r-1", expect.objectContaining({ content: snapshot.content }), expect.anything());
      expect(result.id).toBe("rc-1");
    });
  });
});
