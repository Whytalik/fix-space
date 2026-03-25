import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import type { TestingModule } from "@nestjs/testing";
import { Test } from "@nestjs/testing";
import type { RecordResponseDto } from "@nucleus/domain";
import { FilterLogic } from "@nucleus/domain";
import { FindRecordsUseCase } from "../providers/find-records.usecase";
import { SearchRecordsUseCase } from "../providers/search-records.usecase";
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
    create: jest.fn<any>(),
    findAll: jest.fn<any>(),
    findAllPaged: jest.fn<any>(),
    findOne: jest.fn<any>(),
    update: jest.fn<any>(),
    remove: jest.fn<any>(),
  };

  const mockFindRecordsUseCase = { execute: jest.fn<any>() };
  const mockSearchRecordsUseCase = { execute: jest.fn<any>() };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [RecordController],
      providers: [
        {
          provide: RecordService,
          useValue: mockRecordService,
        },
        {
          provide: FindRecordsUseCase,
          useValue: mockFindRecordsUseCase,
        },
        {
          provide: SearchRecordsUseCase,
          useValue: mockSearchRecordsUseCase,
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

      const result = await controller.findAll(
        "db-123",
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        "user-123",
      );

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

  describe("search", () => {
    it("should delegate to searchRecordsUseCase.execute with spaceId, userId, and q", async () => {
      const mockResults = [{ id: "record-123", name: "Test", databaseId: "db-1" }];
      mockSearchRecordsUseCase.execute.mockResolvedValue(mockResults);

      const result = await controller.search("space-123", "test query", "user-123");

      expect(result).toEqual(mockResults);
      expect(mockSearchRecordsUseCase.execute).toHaveBeenCalledWith("space-123", "user-123", "test query");
      expect(mockSearchRecordsUseCase.execute).toHaveBeenCalledTimes(1);
    });
  });

  describe("findAll (advanced params)", () => {
    it("with sort JSON string → calls findRecordsUseCase.execute with parsed sort array", async () => {
      const sortArray = [{ field: "createdAt", direction: "asc" }];
      const sortRaw = JSON.stringify(sortArray);
      mockFindRecordsUseCase.execute.mockResolvedValue([mockRecordResponse]);

      await controller.findAll("db-123", undefined, undefined, sortRaw, undefined, undefined, undefined, "user-123");

      expect(mockFindRecordsUseCase.execute).toHaveBeenCalledWith(
        "db-123",
        "user-123",
        expect.objectContaining({ sort: sortArray }),
      );
      expect(mockRecordService.findAll).not.toHaveBeenCalled();
    });

    it("with filters JSON string → calls findRecordsUseCase.execute with parsed filters", async () => {
      const filtersArray = [{ propertyId: "prop-1", operator: "equals", value: "hello" }];
      const filtersRaw = JSON.stringify(filtersArray);
      mockFindRecordsUseCase.execute.mockResolvedValue([mockRecordResponse]);

      await controller.findAll("db-123", undefined, undefined, undefined, filtersRaw, undefined, undefined, "user-123");

      expect(mockFindRecordsUseCase.execute).toHaveBeenCalledWith(
        "db-123",
        "user-123",
        expect.objectContaining({ filters: filtersArray }),
      );
    });

    it("with filterLogic → passes filterLogic to findRecordsUseCase.execute", async () => {
      mockFindRecordsUseCase.execute.mockResolvedValue([mockRecordResponse]);

      await controller.findAll(
        "db-123",
        undefined,
        undefined,
        undefined,
        undefined,
        FilterLogic.OR,
        undefined,
        "user-123",
      );

      expect(mockFindRecordsUseCase.execute).toHaveBeenCalledWith(
        "db-123",
        "user-123",
        expect.objectContaining({ filterLogic: FilterLogic.OR }),
      );
    });

    it("with search param → passes search string to findRecordsUseCase.execute", async () => {
      mockFindRecordsUseCase.execute.mockResolvedValue([mockRecordResponse]);

      await controller.findAll("db-123", undefined, undefined, undefined, undefined, undefined, "my query", "user-123");

      expect(mockFindRecordsUseCase.execute).toHaveBeenCalledWith(
        "db-123",
        "user-123",
        expect.objectContaining({ search: "my query" }),
      );
    });

    it("with page + pageSize only (no advanced params) → calls recordService.findAllPaged", async () => {
      const pagedResult = { data: [mockRecordResponse], total: 1, page: 1, pageSize: 10 };
      mockRecordService.findAllPaged.mockResolvedValue(pagedResult);

      const result = await controller.findAll("db-123", 1, 10, undefined, undefined, undefined, undefined, "user-123");

      expect(result).toEqual(pagedResult);
      expect(mockRecordService.findAllPaged).toHaveBeenCalledWith("db-123", "user-123", 1, 10);
      expect(mockFindRecordsUseCase.execute).not.toHaveBeenCalled();
    });
  });
});
