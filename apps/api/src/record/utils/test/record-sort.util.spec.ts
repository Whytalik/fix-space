import "reflect-metadata";
import { describe, expect, it } from "@jest/globals";
import { SortDirection, SortField } from "@nucleus/domain";
import type { RecordWithValues } from "../record-filter.util";
import { compareRecords, compareValues } from "../record-sort.util";

function makeRecord(id: string, overrides: Partial<RecordWithValues> = {}): RecordWithValues {
  return {
    id,
    databaseId: "db-1",
    name: "Record",
    icon: null,
    config: null,
    templateId: null,
    createdAt: new Date("2024-01-01T00:00:00Z"),
    updatedAt: new Date("2024-01-01T00:00:00Z"),
    values: [],
    content: null,
    ...overrides,
  } as unknown as RecordWithValues;
}

function makeRecordWithValue(id: string, propertyId: string, value: unknown): RecordWithValues {
  return makeRecord(id, {
    values: [
      {
        id: `pv-${id}`,
        recordId: id,
        propertyId,
        value: value as any,
        computed: false,
        property: { type: "TEXT", position: 1 },
      } as any,
    ],
  });
}

describe("compareValues", () => {
  describe("null handling", () => {
    it("both null → 0", () => {
      expect(compareValues(null, null, SortDirection.ASC)).toBe(0);
    });

    it("a null → 1 (sorted after b)", () => {
      expect(compareValues(null, "value", SortDirection.ASC)).toBe(1);
    });

    it("b null → -1 (a sorted before null)", () => {
      expect(compareValues("value", null, SortDirection.ASC)).toBe(-1);
    });
  });

  describe("types", () => {
    it("sorts Dates by time", () => {
      const earlier = new Date("2020-01-01");
      const later = new Date("2024-01-01");
      expect(compareValues(earlier, later, SortDirection.ASC)).toBeLessThan(0);
    });

    it("sorts numbers numerically", () => {
      expect(compareValues(10, 20, SortDirection.ASC)).toBeLessThan(0);
      expect(compareValues(20, 10, SortDirection.ASC)).toBeGreaterThan(0);
      expect(compareValues(10, 10, SortDirection.ASC)).toBe(0);
    });

    it("sorts strings with localeCompare", () => {
      expect(compareValues("apple", "banana", SortDirection.ASC)).toBeLessThan(0);
      expect(compareValues("banana", "apple", SortDirection.ASC)).toBeGreaterThan(0);
      expect(compareValues("apple", "apple", SortDirection.ASC)).toBe(0);
    });

    it("sorts booleans (false < true)", () => {
      expect(compareValues(false, true, SortDirection.ASC)).toBeLessThan(0);
      expect(compareValues(true, false, SortDirection.ASC)).toBeGreaterThan(0);
      expect(compareValues(true, true, SortDirection.ASC)).toBe(0);
    });

    it("falls back to string comparison for mixed types", () => {
      const result = compareValues(1, "abc", SortDirection.ASC);
      expect(typeof result).toBe("number");
    });
  });

  describe("direction", () => {
    it("ASC returns negative for a < b", () => {
      expect(compareValues(1, 2, SortDirection.ASC)).toBeLessThan(0);
    });

    it("DESC reverses order (returns positive for a < b)", () => {
      expect(compareValues(1, 2, SortDirection.DESC)).toBeGreaterThan(0);
    });

    it("DESC returns negative for a > b", () => {
      expect(compareValues(2, 1, SortDirection.DESC)).toBeLessThan(0);
    });
  });
});

describe("compareRecords", () => {
  describe("CREATED_AT", () => {
    it("sorts by createdAt ascending", () => {
      const recordA = makeRecord("a", { createdAt: new Date("2020-01-01") });
      const recordB = makeRecord("b", { createdAt: new Date("2024-01-01") });
      const sorts = [{ field: SortField.CREATED_AT, direction: SortDirection.ASC }];
      expect(compareRecords(recordA, recordB, sorts)).toBeLessThan(0);
    });

    it("sorts by createdAt descending", () => {
      const recordA = makeRecord("a", { createdAt: new Date("2020-01-01") });
      const recordB = makeRecord("b", { createdAt: new Date("2024-01-01") });
      const sorts = [{ field: SortField.CREATED_AT, direction: SortDirection.DESC }];
      expect(compareRecords(recordA, recordB, sorts)).toBeGreaterThan(0);
    });
  });

  describe("UPDATED_AT", () => {
    it("sorts by updatedAt", () => {
      const recordA = makeRecord("a", { updatedAt: new Date("2022-01-01") });
      const recordB = makeRecord("b", { updatedAt: new Date("2024-01-01") });
      const sorts = [{ field: SortField.UPDATED_AT, direction: SortDirection.ASC }];
      expect(compareRecords(recordA, recordB, sorts)).toBeLessThan(0);
    });
  });

  describe("PROPERTY", () => {
    it("sorts by property value", () => {
      const recordA = makeRecordWithValue("a", "prop-1", "apple");
      const recordB = makeRecordWithValue("b", "prop-1", "banana");
      const sorts = [{ field: SortField.PROPERTY, direction: SortDirection.ASC, propertyId: "prop-1" }];
      expect(compareRecords(recordA, recordB, sorts)).toBeLessThan(0);
    });

    it("treats missing property value as null (sorted last)", () => {
      const recordA = makeRecord("a");
      const recordB = makeRecordWithValue("b", "prop-1", "value");
      const sorts = [{ field: SortField.PROPERTY, direction: SortDirection.ASC, propertyId: "prop-1" }];
      expect(compareRecords(recordA, recordB, sorts)).toBeGreaterThan(0);
    });
  });

  describe("tiebreaker", () => {
    it("falls through to next sort when first sort is equal", () => {
      const recordA = makeRecord("a", {
        createdAt: new Date("2024-01-01"),
        updatedAt: new Date("2020-01-01"),
      });
      const recordB = makeRecord("b", {
        createdAt: new Date("2024-01-01"),
        updatedAt: new Date("2024-06-01"),
      });
      const sorts = [
        { field: SortField.CREATED_AT, direction: SortDirection.ASC },
        { field: SortField.UPDATED_AT, direction: SortDirection.ASC },
      ];
      expect(compareRecords(recordA, recordB, sorts)).toBeLessThan(0);
    });
  });

  describe("unknown field", () => {
    it("skips unknown sort field (returns 0)", () => {
      const recordA = makeRecord("a");
      const recordB = makeRecord("b");
      const sorts = [{ field: "unknownField" as SortField, direction: SortDirection.ASC }];
      expect(compareRecords(recordA, recordB, sorts)).toBe(0);
    });
  });
});
