import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { NotFoundException } from "@nestjs/common";
import type { TestingModule } from "@nestjs/testing";
import { Test } from "@nestjs/testing";
import type { ContainerBlock } from "@nucleus/domain";
import { AppLogger } from "../../common/logger/app-logger.service";
import { RecordRepository } from "../record.repository";
import { UpdateRecordContentUseCase } from "../providers/update-record-content.usecase";

const mockLogger = {
  setContext: jest.fn<any>(),
  debug: jest.fn<any>(),
  log: jest.fn<any>(),
  warn: jest.fn<any>(),
  error: jest.fn<any>(),
};

const mockRecordRepo = {
  findByIdForOwnerCheck: jest.fn<any>(),
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

const makeContainerBlock = (overrides: Partial<ContainerBlock> = {}): ContainerBlock =>
  ({
    type: "container",
    children: [],
    ...overrides,
  }) as ContainerBlock;

describe("UpdateRecordContentUseCase", () => {
  let useCase: UpdateRecordContentUseCase;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateRecordContentUseCase,
        { provide: AppLogger, useValue: mockLogger },
        { provide: RecordRepository, useValue: mockRecordRepo },
      ],
    }).compile();

    useCase = module.get<UpdateRecordContentUseCase>(UpdateRecordContentUseCase);
  });

  describe("execute — record not found", () => {
    it("should throw NotFoundException when the record does not exist", async () => {
      mockRecordRepo.findByIdForOwnerCheck.mockResolvedValue(null);
      const content = makeContainerBlock();

      await expect(useCase.execute("missing-record", "user-1", content)).rejects.toThrow(NotFoundException);
      await expect(useCase.execute("missing-record", "user-1", content)).rejects.toThrow(
        "Record with id missing-record not found",
      );
    });

    it("should throw NotFoundException when the record belongs to a different user", async () => {
      mockRecordRepo.findByIdForOwnerCheck.mockResolvedValue(null);
      const content = makeContainerBlock();

      await expect(useCase.execute("record-1", "wrong-user", content)).rejects.toThrow(NotFoundException);
    });

    it("should not call upsertContent when the owner check fails", async () => {
      mockRecordRepo.findByIdForOwnerCheck.mockResolvedValue(null);

      await expect(useCase.execute("record-1", "user-1", makeContainerBlock())).rejects.toThrow(NotFoundException);

      expect(mockRecordRepo.upsertContent).not.toHaveBeenCalled();
    });
  });

  describe("execute — successful update", () => {
    it("should return RecordContentResponseDto with the updated content", async () => {
      const lastEditedAt = new Date("2024-06-15T08:30:00Z");
      const newContent = makeContainerBlock({
        children: [{ type: "paragraph", text: "updated text" } as any],
      });
      const upsertedContent = makeRecordContent({
        id: "rc-1",
        recordId: "record-1",
        content: newContent,
        lastEditedAt,
      });

      mockRecordRepo.findByIdForOwnerCheck.mockResolvedValue({ id: "record-1" });
      mockRecordRepo.upsertContent.mockResolvedValue(upsertedContent);

      const result = await useCase.execute("record-1", "user-1", newContent);

      expect(result.id).toBe("rc-1");
      expect(result.recordId).toBe("record-1");
      expect(result.content).toEqual(newContent);
      expect(result.lastEditedAt).toEqual(lastEditedAt);
    });

    it("should call upsertContent with recordId and the provided content", async () => {
      const content = makeContainerBlock({ children: [{ type: "heading", text: "Title" } as any] });

      mockRecordRepo.findByIdForOwnerCheck.mockResolvedValue({ id: "record-1" });
      mockRecordRepo.upsertContent.mockResolvedValue(makeRecordContent({ content }));

      await useCase.execute("record-1", "user-1", content);

      expect(mockRecordRepo.upsertContent).toHaveBeenCalledWith("record-1", content);
    });

    it("should call upsertContent exactly once per execute call", async () => {
      const content = makeContainerBlock();

      mockRecordRepo.findByIdForOwnerCheck.mockResolvedValue({ id: "record-1" });
      mockRecordRepo.upsertContent.mockResolvedValue(makeRecordContent());

      await useCase.execute("record-1", "user-1", content);

      expect(mockRecordRepo.upsertContent).toHaveBeenCalledTimes(1);
    });

    it("should map lastEditedAt as a Date in the response", async () => {
      const lastEditedAt = new Date("2025-01-20T15:45:00.000Z");
      const content = makeContainerBlock();

      mockRecordRepo.findByIdForOwnerCheck.mockResolvedValue({ id: "record-1" });
      mockRecordRepo.upsertContent.mockResolvedValue(makeRecordContent({ lastEditedAt, content }));

      const result = await useCase.execute("record-1", "user-1", content);

      expect(result.lastEditedAt).toEqual(lastEditedAt);
    });
  });

  describe("execute — repository call shape", () => {
    it("should call findByIdForOwnerCheck with recordId and userId", async () => {
      const content = makeContainerBlock();

      mockRecordRepo.findByIdForOwnerCheck.mockResolvedValue({ id: "record-77" });
      mockRecordRepo.upsertContent.mockResolvedValue(makeRecordContent({ recordId: "record-77" }));

      await useCase.execute("record-77", "user-55", content);

      expect(mockRecordRepo.findByIdForOwnerCheck).toHaveBeenCalledWith("record-77", "user-55");
    });
  });
});
