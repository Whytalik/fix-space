import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { Test, TestingModule } from "@nestjs/testing";
import { RecordContentResponseDto } from "@nucleus/domain";
import { RecordContentController } from "../record-content.controller";
import { RecordContentService } from "../record-content.service";

describe("RecordContentController", () => {
  let controller: RecordContentController;

  const mockContentResponse = {
    id: "content-123",
    recordId: "record-123",
    lastEditedAt: new Date("2024-01-01"),
    config: { version: 1 },
  } as unknown as RecordContentResponseDto;

  const mockRecordContentService = {
    findOrCreate: jest.fn<() => Promise<RecordContentResponseDto>>(),
    upsert: jest.fn<() => Promise<RecordContentResponseDto>>(),
    remove: jest.fn<() => Promise<RecordContentResponseDto>>(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [RecordContentController],
      providers: [
        {
          provide: RecordContentService,
          useValue: mockRecordContentService,
        },
      ],
    }).compile();

    controller = module.get<RecordContentController>(RecordContentController);
  });

  describe("findOrCreate", () => {
    it("should call recordContentService.findOrCreate with recordId and userId", async () => {
      mockRecordContentService.findOrCreate.mockResolvedValue(mockContentResponse);

      const result = await controller.findOrCreate("record-123", "user-123");

      expect(result).toEqual(mockContentResponse);
      expect(mockRecordContentService.findOrCreate).toHaveBeenCalledWith("record-123", "user-123");
      expect(mockRecordContentService.findOrCreate).toHaveBeenCalledTimes(1);
    });
  });

  describe("upsert", () => {
    it("should call recordContentService.upsert with recordId, dto and userId", async () => {
      const dto = {
        content: "{}",
      };
      mockRecordContentService.upsert.mockResolvedValue(mockContentResponse);

      const result = await controller.upsert("record-123", "user-123", dto);

      expect(result).toEqual(mockContentResponse);
      expect(mockRecordContentService.upsert).toHaveBeenCalledWith("record-123", dto, "user-123");
      expect(mockRecordContentService.upsert).toHaveBeenCalledTimes(1);
    });
  });

  describe("remove", () => {
    it("should call recordContentService.remove with recordId and userId", async () => {
      mockRecordContentService.remove.mockResolvedValue(mockContentResponse);

      const result = await controller.remove("record-123", "user-123");

      expect(result).toEqual(mockContentResponse);
      expect(mockRecordContentService.remove).toHaveBeenCalledWith("record-123", "user-123");
      expect(mockRecordContentService.remove).toHaveBeenCalledTimes(1);
    });
  });
});
