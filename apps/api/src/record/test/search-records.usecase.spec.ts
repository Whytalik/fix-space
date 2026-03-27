import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { NotFoundException } from "@nestjs/common";
import type { TestingModule } from "@nestjs/testing";
import { Test } from "@nestjs/testing";
import { PropertyType } from "@nucleus/domain";
import { AppLogger } from "../../common/logger/app-logger.service";
import { SpaceRepository } from "../../space/space.repository";
import { RecordRepository } from "../record.repository";
import { SearchRecordsUseCase } from "../providers/search-records.usecase";

const mockLogger = {
  setContext: jest.fn<any>(),
  debug: jest.fn<any>(),
  log: jest.fn<any>(),
  warn: jest.fn<any>(),
  error: jest.fn<any>(),
};

const mockSpaceRepo = {
  findOwner: jest.fn<any>(),
};

const mockRecordRepo = {
  findAllBySpaceForSearch: jest.fn<any>(),
};

const makeRecord = (
  overrides: Partial<{
    id: string;
    name: string;
    databaseId: string;
    icon: string | null;
    database: { id: string; title: string };
    values: Array<{ propertyId: string; value: unknown; property: { type: string } }>;
    createdAt: Date;
    updatedAt: Date;
  }> = {},
) => ({
  id: "rec-1",
  databaseId: "db-1",
  name: "Default Record",
  icon: null,
  createdAt: new Date("2024-01-01"),
  updatedAt: new Date("2024-01-01"),
  database: { id: "db-1", title: "Trading Journal" },
  values: [],
  ...overrides,
});

describe("SearchRecordsUseCase", () => {
  let useCase: SearchRecordsUseCase;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SearchRecordsUseCase,
        { provide: AppLogger, useValue: mockLogger },
        { provide: SpaceRepository, useValue: mockSpaceRepo },
        { provide: RecordRepository, useValue: mockRecordRepo },
      ],
    }).compile();

    useCase = module.get<SearchRecordsUseCase>(SearchRecordsUseCase);
  });

  describe("execute — space validation", () => {
    it("should throw NotFoundException when space is not found", async () => {
      mockSpaceRepo.findOwner.mockResolvedValue(null);

      await expect(useCase.execute("space-missing", "user-1", "apple")).rejects.toThrow(NotFoundException);
      await expect(useCase.execute("space-missing", "user-1", "apple")).rejects.toThrow(
        "Space with id space-missing not found",
      );
    });

    it("should throw NotFoundException when space exists but belongs to a different user", async () => {
      mockSpaceRepo.findOwner.mockResolvedValue({ ownerId: "other-user", isDefault: false });

      await expect(useCase.execute("space-1", "wrong-user", "apple")).rejects.toThrow(NotFoundException);
    });

    it("should not call record findAllBySpaceForSearch when space lookup fails", async () => {
      mockSpaceRepo.findOwner.mockResolvedValue(null);

      await expect(useCase.execute("space-1", "user-1", "apple")).rejects.toThrow(NotFoundException);

      expect(mockRecordRepo.findAllBySpaceForSearch).not.toHaveBeenCalled();
    });

    it("should query space by spaceId", async () => {
      mockSpaceRepo.findOwner.mockResolvedValue({ ownerId: "user-1", isDefault: false });
      mockRecordRepo.findAllBySpaceForSearch.mockResolvedValue([]);

      await useCase.execute("space-1", "user-1", "q");

      expect(mockSpaceRepo.findOwner).toHaveBeenCalledWith("space-1");
    });
  });

  describe("execute — name matching", () => {
    it("should return records whose name matches the search term", async () => {
      mockSpaceRepo.findOwner.mockResolvedValue({ ownerId: "user-1", isDefault: false });
      mockRecordRepo.findAllBySpaceForSearch.mockResolvedValue([
        makeRecord({ id: "r-1", name: "Apple trade", database: { id: "db-1", title: "Journal" } }),
        makeRecord({ id: "r-2", name: "Banana notes", database: { id: "db-1", title: "Journal" } }),
        makeRecord({ id: "r-3", name: "apple recap", database: { id: "db-2", title: "Notes" } }),
      ]);

      const result = await useCase.execute("space-1", "user-1", "apple");

      expect(result).toHaveLength(2);
      expect(result.map((record) => record.id)).toEqual(expect.arrayContaining(["r-1", "r-3"]));
    });

    it("should perform case-insensitive name matching", async () => {
      mockSpaceRepo.findOwner.mockResolvedValue({ ownerId: "user-1", isDefault: false });
      mockRecordRepo.findAllBySpaceForSearch.mockResolvedValue([
        makeRecord({ id: "r-1", name: "APPLE TRADE", database: { id: "db-1", title: "Journal" } }),
      ]);

      const result = await useCase.execute("space-1", "user-1", "apple");

      expect(result).toHaveLength(1);
      expect(result[0]!.id).toBe("r-1");
    });

    it("should return an empty array when no records match the search term", async () => {
      mockSpaceRepo.findOwner.mockResolvedValue({ ownerId: "user-1", isDefault: false });
      mockRecordRepo.findAllBySpaceForSearch.mockResolvedValue([
        makeRecord({ id: "r-1", name: "Alpha", database: { id: "db-1", title: "Journal" } }),
        makeRecord({ id: "r-2", name: "Beta", database: { id: "db-1", title: "Journal" } }),
      ]);

      const result = await useCase.execute("space-1", "user-1", "zzz");

      expect(result).toHaveLength(0);
    });

    it("should return an empty array when there are no records in the space", async () => {
      mockSpaceRepo.findOwner.mockResolvedValue({ ownerId: "user-1", isDefault: false });
      mockRecordRepo.findAllBySpaceForSearch.mockResolvedValue([]);

      const result = await useCase.execute("space-1", "user-1", "anything");

      expect(result).toHaveLength(0);
    });
  });

  describe("execute — databaseTitle on results", () => {
    it("should include the correct databaseTitle from the record's database", async () => {
      mockSpaceRepo.findOwner.mockResolvedValue({ ownerId: "user-1", isDefault: false });
      mockRecordRepo.findAllBySpaceForSearch.mockResolvedValue([
        makeRecord({
          id: "r-1",
          name: "Trade entry",
          database: { id: "db-1", title: "Trading Journal" },
        }),
      ]);

      const result = await useCase.execute("space-1", "user-1", "trade");

      expect(result).toHaveLength(1);
      expect(result[0]!.databaseTitle).toBe("Trading Journal");
    });

    it("should carry the correct databaseTitle for each result when records come from different databases", async () => {
      mockSpaceRepo.findOwner.mockResolvedValue({ ownerId: "user-1", isDefault: false });
      mockRecordRepo.findAllBySpaceForSearch.mockResolvedValue([
        makeRecord({
          id: "r-1",
          name: "Trade alpha",
          databaseId: "db-1",
          database: { id: "db-1", title: "Trading Journal" },
        }),
        makeRecord({
          id: "r-2",
          name: "Trade beta",
          databaseId: "db-2",
          database: { id: "db-2", title: "Daily Routine" },
        }),
      ]);

      const result = await useCase.execute("space-1", "user-1", "trade");

      const r1 = result.find((r) => r.id === "r-1");
      const r2 = result.find((r) => r.id === "r-2");
      expect(r1?.databaseTitle).toBe("Trading Journal");
      expect(r2?.databaseTitle).toBe("Daily Routine");
    });
  });

  describe("execute — result shape", () => {
    it("should map results to SpaceSearchResultDto with all expected fields", async () => {
      const createdAt = new Date("2024-03-01");
      const updatedAt = new Date("2024-03-02");

      mockSpaceRepo.findOwner.mockResolvedValue({ ownerId: "user-1", isDefault: false });
      mockRecordRepo.findAllBySpaceForSearch.mockResolvedValue([
        makeRecord({
          id: "r-1",
          name: "My Record",
          icon: "📝",
          databaseId: "db-1",
          database: { id: "db-1", title: "Notes" },
          values: [{ propertyId: "p-1", value: "some text", property: { type: PropertyType.TEXT } }],
          createdAt,
          updatedAt,
        }),
      ]);

      const result = await useCase.execute("space-1", "user-1", "my");

      expect(result).toHaveLength(1);
      const dto = result[0]!;
      expect(dto.id).toBe("r-1");
      expect(dto.name).toBe("My Record");
      expect(dto.icon).toBe("📝");
      expect(dto.databaseId).toBe("db-1");
      expect(dto.databaseTitle).toBe("Notes");
      expect(dto.createdAt).toEqual(createdAt);
      expect(dto.updatedAt).toEqual(updatedAt);
    });
  });

  describe("execute — repository call shape", () => {
    it("should call findAllBySpaceForSearch with spaceId and userId", async () => {
      mockSpaceRepo.findOwner.mockResolvedValue({ ownerId: "user-99", isDefault: false });
      mockRecordRepo.findAllBySpaceForSearch.mockResolvedValue([]);

      await useCase.execute("space-42", "user-99", "q");

      expect(mockRecordRepo.findAllBySpaceForSearch).toHaveBeenCalledWith("space-42", "user-99");
    });
  });
});
