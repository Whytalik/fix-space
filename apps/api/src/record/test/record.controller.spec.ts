import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { Test, TestingModule } from "@nestjs/testing";
import { RecordResponseDto } from "@nucleus/domain";
import { RecordController } from "../record.controller";
import { RecordService } from "../record.service";

describe("RecordController", () => {
  let controller: RecordController;

  const mockRecordResponse = {
    id: "record-123",
    databaseId: "db-123",
    name: "Test Record",
    icon: "📝",
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
    config: null,
    values: [],
    content: null,
  } as unknown as RecordResponseDto;

  const mockRecordService = {
    create: jest.fn<() => Promise<RecordResponseDto>>(),
    findAll: jest.fn<() => Promise<RecordResponseDto[]>>(),
    findOne: jest.fn<() => Promise<RecordResponseDto>>(),
    update: jest.fn<() => Promise<RecordResponseDto>>(),
    remove: jest.fn<() => Promise<RecordResponseDto>>(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [RecordController],
      providers: [
        {
          provide: RecordService,
          useValue: mockRecordService,
        },
      ],
    }).compile();

    controller = module.get<RecordController>(RecordController);
  });

  describe("create", () => {
    it("should call recordService.create with dto.databaseId, dto and userId", async () => {
      const dto = {
        name: "New Record",
        icon: "📝",
        databaseId: "db-123",
      };
      mockRecordService.create.mockResolvedValue(mockRecordResponse);

      const result = await controller.create("user-123", dto);

      expect(result).toEqual(mockRecordResponse);
      expect(mockRecordService.create).toHaveBeenCalledWith("db-123", dto, "user-123");
      expect(mockRecordService.create).toHaveBeenCalledTimes(1);
    });
  });

  describe("findAll", () => {
    it("should call recordService.findAll with databaseId query param and userId", async () => {
      mockRecordService.findAll.mockResolvedValue([mockRecordResponse]);

      const result = await controller.findAll("db-123", "user-123");

      expect(result).toEqual([mockRecordResponse]);
      expect(mockRecordService.findAll).toHaveBeenCalledWith("db-123", "user-123");
      expect(mockRecordService.findAll).toHaveBeenCalledTimes(1);
    });
  });

  describe("findOne", () => {
    it("should call recordService.findOne with id and userId", async () => {
      mockRecordService.findOne.mockResolvedValue(mockRecordResponse);

      const result = await controller.findOne("record-123", "user-123");

      expect(result).toEqual(mockRecordResponse);
      expect(mockRecordService.findOne).toHaveBeenCalledWith("record-123", "user-123");
      expect(mockRecordService.findOne).toHaveBeenCalledTimes(1);
    });
  });

  describe("update", () => {
    it("should call recordService.update with id, dto and userId", async () => {
      const dto = {
        name: "Updated Record",
      };
      const updatedResponse = {
        ...mockRecordResponse,
        name: "Updated Record",
      } as unknown as RecordResponseDto;
      mockRecordService.update.mockResolvedValue(updatedResponse);

      const result = await controller.update("record-123", "user-123", dto);

      expect(result).toEqual(updatedResponse);
      expect(mockRecordService.update).toHaveBeenCalledWith("record-123", dto, "user-123");
      expect(mockRecordService.update).toHaveBeenCalledTimes(1);
    });
  });

  describe("remove", () => {
    it("should call recordService.remove with id and userId", async () => {
      mockRecordService.remove.mockResolvedValue(mockRecordResponse);

      const result = await controller.remove("record-123", "user-123");

      expect(result).toEqual(mockRecordResponse);
      expect(mockRecordService.remove).toHaveBeenCalledWith("record-123", "user-123");
      expect(mockRecordService.remove).toHaveBeenCalledTimes(1);
    });
  });
});
