import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { NotFoundException } from "@nestjs/common";
import { BlockType } from "@nucleus/domain";
import type { TestingModule } from "@nestjs/testing";
import { Test } from "@nestjs/testing";
import { AppLogger } from "../../common/logger/app-logger.service";
import { RecordRepository } from "../record.repository";
import { GetRecordContentUseCase } from "../providers/get-record-content.usecase";

const mockLogger = {
  setContext: jest.fn<any>(),
  debug: jest.fn<any>(),
  log: jest.fn<any>(),
  warn: jest.fn<any>(),
  error: jest.fn<any>(),
};

const mockRecordRepo = {
  findByIdForOwnerCheck: jest.fn<any>(),
  findContent: jest.fn<any>(),
  upsertContent: jest.fn<any>(),
};

const makeRecordContent = (
  overrides: Partial<{
    id: string;
    recordId: string;
    content: object;
    lastEditedAt: Date;
  }> = {},
) => ({
  id: "rc-1",
  recordId: "record-1",
  content: { type: "container", children: [] },
  lastEditedAt: new Date("2024-06-01T12:00:00Z"),
  ...overrides,
});

describe("GetRecordContentUseCase", () => {
  let useCase: GetRecordContentUseCase;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetRecordContentUseCase,
        { provide: AppLogger, useValue: mockLogger },
        { provide: RecordRepository, useValue: mockRecordRepo },
      ],
    }).compile();

    useCase = module.get<GetRecordContentUseCase>(GetRecordContentUseCase);
  });

  describe("execute — record not found", () => {
    it("should throw NotFoundException when the record does not exist", async () => {
      mockRecordRepo.findByIdForOwnerCheck.mockResolvedValue(null);

      await expect(useCase.execute("missing-record", "user-1")).rejects.toThrow(NotFoundException);
      await expect(useCase.execute("missing-record", "user-1")).rejects.toThrow(
        "Record with id missing-record not found",
      );
    });

    it("should throw NotFoundException when the record belongs to a different user", async () => {
      mockRecordRepo.findByIdForOwnerCheck.mockResolvedValue(null);

      await expect(useCase.execute("record-1", "wrong-user")).rejects.toThrow(NotFoundException);
    });

    it("should not call findContent when the owner check fails", async () => {
      mockRecordRepo.findByIdForOwnerCheck.mockResolvedValue(null);

      await expect(useCase.execute("record-1", "user-1")).rejects.toThrow(NotFoundException);

      expect(mockRecordRepo.findContent).not.toHaveBeenCalled();
    });
  });

  describe("execute — existing content", () => {
    it("should return RecordContentResponseDto mapped from existing content", async () => {
      const lastEditedAt = new Date("2024-06-01T12:00:00Z");
      const existingContent = makeRecordContent({
        id: "rc-1",
        recordId: "record-1",
        content: { type: "container", children: [{ type: "paragraph", text: "hello" }] },
        lastEditedAt,
      });

      mockRecordRepo.findByIdForOwnerCheck.mockResolvedValue({ id: "record-1" });
      mockRecordRepo.findContent.mockResolvedValue(existingContent);

      const result = await useCase.execute("record-1", "user-1");

      expect(result.id).toBe("rc-1");
      expect(result.recordId).toBe("record-1");
      expect(result.content).toEqual({ type: "container", children: [{ type: "paragraph", text: "hello" }] });
      expect(result.lastEditedAt).toEqual(lastEditedAt);
    });

    it("should not call upsertContent when existing content is found", async () => {
      mockRecordRepo.findByIdForOwnerCheck.mockResolvedValue({ id: "record-1" });
      mockRecordRepo.findContent.mockResolvedValue(makeRecordContent());

      await useCase.execute("record-1", "user-1");

      expect(mockRecordRepo.upsertContent).not.toHaveBeenCalled();
    });

    it("should call findContent with the correct recordId", async () => {
      mockRecordRepo.findByIdForOwnerCheck.mockResolvedValue({ id: "record-42" });
      mockRecordRepo.findContent.mockResolvedValue(makeRecordContent({ recordId: "record-42" }));

      await useCase.execute("record-42", "user-1");

      expect(mockRecordRepo.findContent).toHaveBeenCalledWith("record-42");
    });
  });

  describe("execute — no content exists yet", () => {
    it("should upsert empty content and return it when no content is found", async () => {
      const upsertedContent = makeRecordContent({
        id: "rc-new",
        recordId: "record-1",
        content: {},
        lastEditedAt: new Date("2024-06-02T09:00:00Z"),
      });

      mockRecordRepo.findByIdForOwnerCheck.mockResolvedValue({ id: "record-1" });
      mockRecordRepo.findContent.mockResolvedValue(null);
      mockRecordRepo.upsertContent.mockResolvedValue(upsertedContent);

      const result = await useCase.execute("record-1", "user-1");

      expect(mockRecordRepo.upsertContent).toHaveBeenCalledWith("record-1", { id: "record-1", type: BlockType.BLOCK, children: [] });
      expect(result.id).toBe("rc-new");
      expect(result.recordId).toBe("record-1");
      expect(result.content).toEqual({});
      expect(result.lastEditedAt).toEqual(upsertedContent.lastEditedAt);
    });

    it("should call upsertContent with an empty object as content initialiser", async () => {
      mockRecordRepo.findByIdForOwnerCheck.mockResolvedValue({ id: "record-1" });
      mockRecordRepo.findContent.mockResolvedValue(null);
      mockRecordRepo.upsertContent.mockResolvedValue(makeRecordContent({ content: {} }));

      await useCase.execute("record-1", "user-1");

      expect(mockRecordRepo.upsertContent).toHaveBeenCalledTimes(1);
      expect(mockRecordRepo.upsertContent).toHaveBeenCalledWith("record-1", { id: "record-1", type: BlockType.BLOCK, children: [] });
    });
  });

  describe("execute — repository call shape", () => {
    it("should call findByIdForOwnerCheck with recordId and userId", async () => {
      mockRecordRepo.findByIdForOwnerCheck.mockResolvedValue({ id: "record-99" });
      mockRecordRepo.findContent.mockResolvedValue(makeRecordContent({ recordId: "record-99" }));

      await useCase.execute("record-99", "user-42");

      expect(mockRecordRepo.findByIdForOwnerCheck).toHaveBeenCalledWith("record-99", "user-42");
    });
  });
});
