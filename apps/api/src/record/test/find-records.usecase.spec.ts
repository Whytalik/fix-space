import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { BadRequestException } from "@nestjs/common";
import type { TestingModule } from "@nestjs/testing";
import { Test } from "@nestjs/testing";
import { FilterLogic, FilterOperator, PropertyType, SortDirection, SortField } from "@nucleus/domain";
import { AppLogger } from "../../common/logger/app-logger.service";
import { RecordRepository } from "../record.repository";
import { FindRecordsUseCase } from "../providers/find-records.usecase";

const mockLogger = {
  setContext: jest.fn<any>(),
  debug: jest.fn<any>(),
  log: jest.fn<any>(),
  warn: jest.fn<any>(),
  error: jest.fn<any>(),
};

const mockRecordRepo = {
  findWithFilters: jest.fn<any>(),
};

const makeRecord = (
  overrides: Partial<{
    id: string;
    name: string;
    createdAt: Date;
    updatedAt: Date;
    values: Array<{ propertyId: string; value: unknown; property: { type: string } }>;
  }> = {},
) => ({
  id: "record-1",
  databaseId: "db-1",
  name: "Alpha",
  icon: null,
  config: null,
  createdAt: new Date("2024-01-01T10:00:00Z"),
  updatedAt: new Date("2024-01-01T10:00:00Z"),
  content: null,
  values: [],
  ...overrides,
});

describe("FindRecordsUseCase", () => {
  let useCase: FindRecordsUseCase;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FindRecordsUseCase,
        { provide: AppLogger, useValue: mockLogger },
        { provide: RecordRepository, useValue: mockRecordRepo },
      ],
    }).compile();

    useCase = module.get<FindRecordsUseCase>(FindRecordsUseCase);
  });

  describe("execute — pagination", () => {
    it("should return a plain array when no pagination is given", async () => {
      const records = [makeRecord({ id: "r-1", name: "Alpha" }), makeRecord({ id: "r-2", name: "Beta" })];
      mockRecordRepo.findWithFilters.mockResolvedValue(records);

      const result = await useCase.execute("db-1", "user-1", {});

      expect(Array.isArray(result)).toBe(true);
      expect(result).toHaveLength(2);
    });

    it("should return paged result when page and pageSize are provided", async () => {
      const records = [
        makeRecord({ id: "r-1", name: "Alpha", createdAt: new Date("2024-01-03") }),
        makeRecord({ id: "r-2", name: "Beta", createdAt: new Date("2024-01-02") }),
        makeRecord({ id: "r-3", name: "Gamma", createdAt: new Date("2024-01-01") }),
      ];
      mockRecordRepo.findWithFilters.mockResolvedValue(records);

      const result = await useCase.execute("db-1", "user-1", { page: 1, pageSize: 2 });

      expect(result).not.toBeInstanceOf(Array);
      const paged = result as { data: unknown[]; total: number; page: number; pageSize: number };
      expect(paged.total).toBe(3);
      expect(paged.page).toBe(1);
      expect(paged.pageSize).toBe(2);
      expect(paged.data).toHaveLength(2);
    });

    it("should return the correct page slice", async () => {
      const records = [
        makeRecord({ id: "r-1", name: "Alpha", createdAt: new Date("2024-01-03") }),
        makeRecord({ id: "r-2", name: "Beta", createdAt: new Date("2024-01-02") }),
        makeRecord({ id: "r-3", name: "Gamma", createdAt: new Date("2024-01-01") }),
      ];
      mockRecordRepo.findWithFilters.mockResolvedValue(records);

      const result = (await useCase.execute("db-1", "user-1", { page: 2, pageSize: 2 })) as {
        data: Array<{ id: string }>;
        total: number;
        page: number;
        pageSize: number;
      };

      expect(result.data).toHaveLength(1);
      expect(result.data[0]!.id).toBe("r-3");
    });

    it("should throw BadRequestException when page < 1", async () => {
      await expect(useCase.execute("db-1", "user-1", { page: 0, pageSize: 10 })).rejects.toThrow(BadRequestException);
      await expect(useCase.execute("db-1", "user-1", { page: 0, pageSize: 10 })).rejects.toThrow(
        "page and pageSize must be positive integers",
      );
    });

    it("should throw BadRequestException when pageSize < 1", async () => {
      await expect(useCase.execute("db-1", "user-1", { page: 1, pageSize: 0 })).rejects.toThrow(BadRequestException);
    });

    it("should throw BadRequestException when both page and pageSize are negative", async () => {
      await expect(useCase.execute("db-1", "user-1", { page: -1, pageSize: -5 })).rejects.toThrow(BadRequestException);
    });

    it("should not validate pagination when only page is given without pageSize", async () => {
      mockRecordRepo.findWithFilters.mockResolvedValue([]);

      const result = await useCase.execute("db-1", "user-1", { page: 0 });

      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe("execute — search", () => {
    it("should return only records whose name matches the search term", async () => {
      const records = [
        makeRecord({ id: "r-1", name: "Apple trade" }),
        makeRecord({ id: "r-2", name: "Banana strategy" }),
        makeRecord({ id: "r-3", name: "apple recap" }),
      ];
      mockRecordRepo.findWithFilters.mockResolvedValue(records);

      const result = (await useCase.execute("db-1", "user-1", { search: "apple" })) as Array<{ id: string }>;

      expect(result).toHaveLength(2);
      expect(result.map((record) => record.id)).toEqual(expect.arrayContaining(["r-1", "r-3"]));
    });

    it("should return an empty array when search term matches nothing", async () => {
      const records = [makeRecord({ id: "r-1", name: "Alpha" }), makeRecord({ id: "r-2", name: "Beta" })];
      mockRecordRepo.findWithFilters.mockResolvedValue(records);

      const result = (await useCase.execute("db-1", "user-1", { search: "zzz" })) as Array<unknown>;

      expect(result).toHaveLength(0);
    });
  });

  describe("execute — filters (AND logic)", () => {
    it("should keep only records where all filters match under AND logic", async () => {
      const records = [
        makeRecord({
          id: "r-1",
          name: "Match",
          values: [
            { propertyId: "p-1", value: "hello world", property: { type: PropertyType.TEXT } },
            { propertyId: "p-2", value: "42", property: { type: PropertyType.NUMBER } },
          ],
        }),
        makeRecord({
          id: "r-2",
          name: "Partial",
          values: [
            { propertyId: "p-1", value: "hello world", property: { type: PropertyType.TEXT } },
            { propertyId: "p-2", value: "10", property: { type: PropertyType.NUMBER } },
          ],
        }),
      ];
      mockRecordRepo.findWithFilters.mockResolvedValue(records);

      const result = (await useCase.execute("db-1", "user-1", {
        filterLogic: FilterLogic.AND,
        filters: [
          { propertyId: "p-1", operator: FilterOperator.CONTAINS, value: "hello" },
          { propertyId: "p-2", operator: FilterOperator.EQUALS, value: "42" },
        ],
      })) as Array<{ id: string }>;

      expect(result).toHaveLength(1);
      expect(result[0]!.id).toBe("r-1");
    });

    it("should default to AND logic when filterLogic is not specified", async () => {
      const records = [
        makeRecord({
          id: "r-1",
          name: "Both match",
          values: [
            { propertyId: "p-1", value: "foo", property: { type: PropertyType.TEXT } },
            { propertyId: "p-2", value: "bar", property: { type: PropertyType.TEXT } },
          ],
        }),
        makeRecord({
          id: "r-2",
          name: "One match",
          values: [
            { propertyId: "p-1", value: "foo", property: { type: PropertyType.TEXT } },
            { propertyId: "p-2", value: "nope", property: { type: PropertyType.TEXT } },
          ],
        }),
      ];
      mockRecordRepo.findWithFilters.mockResolvedValue(records);

      const result = (await useCase.execute("db-1", "user-1", {
        filters: [
          { propertyId: "p-1", operator: FilterOperator.EQUALS, value: "foo" },
          { propertyId: "p-2", operator: FilterOperator.EQUALS, value: "bar" },
        ],
      })) as Array<{ id: string }>;

      expect(result).toHaveLength(1);
      expect(result[0]!.id).toBe("r-1");
    });
  });

  describe("execute — filters (OR logic)", () => {
    it("should keep records where any filter matches under OR logic", async () => {
      const records = [
        makeRecord({
          id: "r-1",
          name: "Matches first",
          values: [{ propertyId: "p-1", value: "alpha", property: { type: PropertyType.TEXT } }],
        }),
        makeRecord({
          id: "r-2",
          name: "Matches second",
          values: [{ propertyId: "p-1", value: "beta", property: { type: PropertyType.TEXT } }],
        }),
        makeRecord({
          id: "r-3",
          name: "No match",
          values: [{ propertyId: "p-1", value: "gamma", property: { type: PropertyType.TEXT } }],
        }),
      ];
      mockRecordRepo.findWithFilters.mockResolvedValue(records);

      const result = (await useCase.execute("db-1", "user-1", {
        filterLogic: FilterLogic.OR,
        filters: [
          { propertyId: "p-1", operator: FilterOperator.EQUALS, value: "alpha" },
          { propertyId: "p-1", operator: FilterOperator.EQUALS, value: "beta" },
        ],
      })) as Array<{ id: string }>;

      expect(result).toHaveLength(2);
      expect(result.map((record) => record.id)).toEqual(expect.arrayContaining(["r-1", "r-2"]));
    });
  });

  describe("execute — unknown propertyId in filter", () => {
    it("should pass (include) a record when the filtered propertyId does not exist on the record", async () => {
      const records = [makeRecord({ id: "r-1", name: "No matching property", values: [] })];
      mockRecordRepo.findWithFilters.mockResolvedValue(records);

      const result = (await useCase.execute("db-1", "user-1", {
        filters: [{ propertyId: "unknown-prop", operator: FilterOperator.EQUALS, value: "anything" }],
      })) as Array<{ id: string }>;

      expect(result).toHaveLength(1);
      expect(result[0]!.id).toBe("r-1");
    });
  });

  describe("execute — sorting", () => {
    it("should fall back to createdAt DESC when no sort is provided", async () => {
      const records = [
        makeRecord({ id: "r-2", name: "Newest", createdAt: new Date("2024-01-03") }),
        makeRecord({ id: "r-3", name: "Middle", createdAt: new Date("2024-01-02") }),
        makeRecord({ id: "r-1", name: "Oldest", createdAt: new Date("2024-01-01") }),
      ];
      mockRecordRepo.findWithFilters.mockResolvedValue(records);

      const result = (await useCase.execute("db-1", "user-1", {})) as Array<{ id: string }>;

      expect(result[0]!.id).toBe("r-2");
      expect(result[1]!.id).toBe("r-3");
      expect(result[2]!.id).toBe("r-1");
      expect(mockRecordRepo.findWithFilters).toHaveBeenCalledWith(
        "db-1",
        "user-1",
        undefined,
        [{ createdAt: "desc" }],
      );
    });

    it("should sort by createdAt ASC when explicitly provided", async () => {
      const records = [
        makeRecord({ id: "r-1", name: "Oldest", createdAt: new Date("2024-01-01") }),
        makeRecord({ id: "r-3", name: "Middle", createdAt: new Date("2024-01-02") }),
        makeRecord({ id: "r-2", name: "Newest", createdAt: new Date("2024-01-03") }),
      ];
      mockRecordRepo.findWithFilters.mockResolvedValue(records);

      const result = (await useCase.execute("db-1", "user-1", {
        sort: [{ field: SortField.CREATED_AT, direction: SortDirection.ASC }],
      })) as Array<{ id: string }>;

      expect(result[0]!.id).toBe("r-1");
      expect(result[1]!.id).toBe("r-3");
      expect(result[2]!.id).toBe("r-2");
      expect(mockRecordRepo.findWithFilters).toHaveBeenCalledWith(
        "db-1",
        "user-1",
        undefined,
        [{ createdAt: "asc" }],
      );
    });

    it("should sort by updatedAt DESC when provided", async () => {
      const records = [
        makeRecord({ id: "r-1", name: "Recently updated", updatedAt: new Date("2024-06-10") }),
        makeRecord({ id: "r-2", name: "Older update", updatedAt: new Date("2024-01-01") }),
      ];
      mockRecordRepo.findWithFilters.mockResolvedValue(records);

      const result = (await useCase.execute("db-1", "user-1", {
        sort: [{ field: SortField.UPDATED_AT, direction: SortDirection.DESC }],
      })) as Array<{ id: string }>;

      expect(result[0]!.id).toBe("r-1");
      expect(result[1]!.id).toBe("r-2");
    });

    it("should sort by a property value when field is PROPERTY", async () => {
      const records = [
        makeRecord({
          id: "r-1",
          name: "Zeta",
          values: [{ propertyId: "p-name", value: "Zeta", property: { type: PropertyType.TEXT } }],
        }),
        makeRecord({
          id: "r-2",
          name: "Alpha",
          values: [{ propertyId: "p-name", value: "Alpha", property: { type: PropertyType.TEXT } }],
        }),
      ];
      mockRecordRepo.findWithFilters.mockResolvedValue(records);

      const result = (await useCase.execute("db-1", "user-1", {
        sort: [{ field: SortField.PROPERTY, propertyId: "p-name", direction: SortDirection.ASC }],
      })) as Array<{ id: string }>;

      expect(result[0]!.id).toBe("r-2");
      expect(result[1]!.id).toBe("r-1");
    });
  });

  describe("execute — repository call shape", () => {
    it("should call findWithFilters with databaseId, userId, and default orderBy", async () => {
      mockRecordRepo.findWithFilters.mockResolvedValue([]);

      await useCase.execute("db-abc", "user-xyz", {});

      expect(mockRecordRepo.findWithFilters).toHaveBeenCalledWith(
        "db-abc",
        "user-xyz",
        undefined,
        [{ createdAt: "desc" }],
      );
    });
  });
});
