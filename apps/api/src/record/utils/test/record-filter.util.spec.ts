import "reflect-metadata";
import { describe, expect, it } from "@jest/globals";
import type { RecordFilterDto } from "@nucleus/domain";
import { FilterField, FilterOperator, PropertyType } from "@nucleus/domain";
import type { RecordWithValues} from "../record-filter.util";
import { matchesFilter } from "../record-filter.util";

function makeRecord(propertyId: string, type: string, value: unknown): RecordWithValues {
  return {
    id: "r-1",
    databaseId: "db-1",
    name: "Test Record",
    icon: null,
    config: null,
    createdAt: new Date("2024-06-15T12:00:00Z"),
    updatedAt: new Date("2024-06-15T12:00:00Z"),
    templateId: null,
    values: [
      {
        id: "pv-1",
        recordId: "r-1",
        propertyId,
        value: value as any,
        computed: false,
        property: { type, position: 1 },
      },
    ],
    content: null,
  } as unknown as RecordWithValues;
}

function filter(overrides: Partial<RecordFilterDto>): RecordFilterDto {
  return {
    field: FilterField.PROPERTY,
    propertyId: "prop-1",
    operator: FilterOperator.EQUALS,
    ...overrides,
  } as RecordFilterDto;
}

describe("matchesFilter", () => {
  describe("meta-field filters (CREATED_AT / UPDATED_AT)", () => {
    const record = makeRecord("x", PropertyType.TEXT, null);

    it("EQUALS returns true for matching date", () => {
      const filterDto = {
        field: FilterField.CREATED_AT,
        operator: FilterOperator.EQUALS,
        value: "2024-06-15T12:00:00Z",
      } as RecordFilterDto;
      expect(matchesFilter(record, filterDto)).toBe(true);
    });

    it("EQUALS returns false for non-matching date", () => {
      const filterDto = {
        field: FilterField.CREATED_AT,
        operator: FilterOperator.EQUALS,
        value: "2024-01-01T00:00:00Z",
      } as RecordFilterDto;
      expect(matchesFilter(record, filterDto)).toBe(false);
    });

    it("NOT_EQUALS returns true when dates differ", () => {
      const filterDto = {
        field: FilterField.UPDATED_AT,
        operator: FilterOperator.NOT_EQUALS,
        value: "2024-01-01T00:00:00Z",
      } as RecordFilterDto;
      expect(matchesFilter(record, filterDto)).toBe(true);
    });

    it("BEFORE returns true when record date is before filter date", () => {
      const filterDto = {
        field: FilterField.CREATED_AT,
        operator: FilterOperator.BEFORE,
        value: "2025-01-01T00:00:00Z",
      } as RecordFilterDto;
      expect(matchesFilter(record, filterDto)).toBe(true);
    });

    it("AFTER returns true when record date is after filter date", () => {
      const filterDto = {
        field: FilterField.CREATED_AT,
        operator: FilterOperator.AFTER,
        value: "2020-01-01T00:00:00Z",
      } as RecordFilterDto;
      expect(matchesFilter(record, filterDto)).toBe(true);
    });

    it("ON_OR_BEFORE returns true for equal date", () => {
      const filterDto = {
        field: FilterField.CREATED_AT,
        operator: FilterOperator.ON_OR_BEFORE,
        value: "2024-06-15T12:00:00Z",
      } as RecordFilterDto;
      expect(matchesFilter(record, filterDto)).toBe(true);
    });

    it("ON_OR_AFTER returns true for equal date", () => {
      const filterDto = {
        field: FilterField.CREATED_AT,
        operator: FilterOperator.ON_OR_AFTER,
        value: "2024-06-15T12:00:00Z",
      } as RecordFilterDto;
      expect(matchesFilter(record, filterDto)).toBe(true);
    });

    it("IS_EMPTY returns false when date is set", () => {
      const filterDto = { field: FilterField.CREATED_AT, operator: FilterOperator.IS_EMPTY } as RecordFilterDto;
      expect(matchesFilter(record, filterDto)).toBe(false);
    });

    it("IS_NOT_EMPTY returns true when date is set", () => {
      const filterDto = { field: FilterField.CREATED_AT, operator: FilterOperator.IS_NOT_EMPTY } as RecordFilterDto;
      expect(matchesFilter(record, filterDto)).toBe(true);
    });

    it("EQUALS returns false for invalid filter date", () => {
      const filterDto = {
        field: FilterField.CREATED_AT,
        operator: FilterOperator.EQUALS,
        value: "not-a-date",
      } as RecordFilterDto;
      expect(matchesFilter(record, filterDto)).toBe(false);
    });
  });

  describe("TEXT / FORMULA", () => {
    const record = makeRecord("prop-1", PropertyType.TEXT, "Hello World");

    it("EQUALS matches case-insensitively", () => {
      expect(matchesFilter(record, filter({ operator: FilterOperator.EQUALS, value: "hello world" }))).toBe(true);
    });

    it("NOT_EQUALS returns false for matching value", () => {
      expect(matchesFilter(record, filter({ operator: FilterOperator.NOT_EQUALS, value: "Hello World" }))).toBe(false);
    });

    it("CONTAINS returns true for substring", () => {
      expect(matchesFilter(record, filter({ operator: FilterOperator.CONTAINS, value: "world" }))).toBe(true);
    });

    it("NOT_CONTAINS returns false when value is present", () => {
      expect(matchesFilter(record, filter({ operator: FilterOperator.NOT_CONTAINS, value: "world" }))).toBe(false);
    });

    it("STARTS_WITH matches prefix", () => {
      expect(matchesFilter(record, filter({ operator: FilterOperator.STARTS_WITH, value: "hello" }))).toBe(true);
    });

    it("ENDS_WITH matches suffix", () => {
      expect(matchesFilter(record, filter({ operator: FilterOperator.ENDS_WITH, value: "world" }))).toBe(true);
    });

    it("IS_EMPTY returns false for non-empty value", () => {
      expect(matchesFilter(record, filter({ operator: FilterOperator.IS_EMPTY }))).toBe(false);
    });

    it("IS_NOT_EMPTY returns true for non-empty value", () => {
      expect(matchesFilter(record, filter({ operator: FilterOperator.IS_NOT_EMPTY }))).toBe(true);
    });

    it("IS_EMPTY returns true for null value", () => {
      const emptyRecord = makeRecord("prop-1", PropertyType.TEXT, null);
      expect(matchesFilter(emptyRecord, filter({ operator: FilterOperator.IS_EMPTY }))).toBe(true);
    });

    it("FORMULA type also matches text logic", () => {
      const formulaRecord = makeRecord("prop-1", PropertyType.FORMULA, "computed");
      expect(matchesFilter(formulaRecord, filter({ operator: FilterOperator.EQUALS, value: "computed" }))).toBe(true);
    });
  });

  describe("NUMBER", () => {
    const record = makeRecord("prop-1", PropertyType.NUMBER, 42);

    it("EQUALS returns true for matching number", () => {
      expect(matchesFilter(record, filter({ operator: FilterOperator.EQUALS, value: 42 }))).toBe(true);
    });

    it("NOT_EQUALS returns true for different number", () => {
      expect(matchesFilter(record, filter({ operator: FilterOperator.NOT_EQUALS, value: 10 }))).toBe(true);
    });

    it("GREATER_THAN returns true when value is greater", () => {
      expect(matchesFilter(record, filter({ operator: FilterOperator.GREATER_THAN, value: 10 }))).toBe(true);
    });

    it("LESS_THAN returns true when value is less", () => {
      expect(matchesFilter(record, filter({ operator: FilterOperator.LESS_THAN, value: 100 }))).toBe(true);
    });

    it("GREATER_THAN_OR_EQUAL returns true for equal", () => {
      expect(matchesFilter(record, filter({ operator: FilterOperator.GREATER_THAN_OR_EQUAL, value: 42 }))).toBe(true);
    });

    it("LESS_THAN_OR_EQUAL returns true for equal", () => {
      expect(matchesFilter(record, filter({ operator: FilterOperator.LESS_THAN_OR_EQUAL, value: 42 }))).toBe(true);
    });

    it("IS_EMPTY returns false for non-null number", () => {
      expect(matchesFilter(record, filter({ operator: FilterOperator.IS_EMPTY }))).toBe(false);
    });

    it("IS_NOT_EMPTY returns true for non-null number", () => {
      expect(matchesFilter(record, filter({ operator: FilterOperator.IS_NOT_EMPTY }))).toBe(true);
    });
  });

  describe("DATE", () => {
    const record = makeRecord("prop-1", PropertyType.DATE, "2024-06-15T00:00:00Z");

    it("EQUALS returns true for matching date string", () => {
      expect(matchesFilter(record, filter({ operator: FilterOperator.EQUALS, value: "2024-06-15T00:00:00Z" }))).toBe(
        true,
      );
    });

    it("BEFORE returns true when record date is earlier", () => {
      expect(matchesFilter(record, filter({ operator: FilterOperator.BEFORE, value: "2025-01-01T00:00:00Z" }))).toBe(
        true,
      );
    });

    it("AFTER returns true when record date is later", () => {
      expect(matchesFilter(record, filter({ operator: FilterOperator.AFTER, value: "2020-01-01T00:00:00Z" }))).toBe(
        true,
      );
    });

    it("ON_OR_BEFORE returns true for equal date", () => {
      expect(
        matchesFilter(record, filter({ operator: FilterOperator.ON_OR_BEFORE, value: "2024-06-15T00:00:00Z" })),
      ).toBe(true);
    });

    it("ON_OR_AFTER returns true for equal date", () => {
      expect(
        matchesFilter(record, filter({ operator: FilterOperator.ON_OR_AFTER, value: "2024-06-15T00:00:00Z" })),
      ).toBe(true);
    });

    it("IS_EMPTY returns false for non-null date", () => {
      expect(matchesFilter(record, filter({ operator: FilterOperator.IS_EMPTY }))).toBe(false);
    });

    it("IS_NOT_EMPTY returns true for non-null date", () => {
      expect(matchesFilter(record, filter({ operator: FilterOperator.IS_NOT_EMPTY }))).toBe(true);
    });

    it("EQUALS returns false for invalid date string", () => {
      const invalidRecord = makeRecord("prop-1", PropertyType.DATE, "not-a-date");
      expect(matchesFilter(invalidRecord, filter({ operator: FilterOperator.EQUALS, value: "not-a-date" }))).toBe(
        false,
      );
    });
  });

  describe("CHECKBOX", () => {
    it("IS_CHECKED returns true when value is true", () => {
      const record = makeRecord("prop-1", PropertyType.CHECKBOX, true);
      expect(matchesFilter(record, filter({ operator: FilterOperator.IS_CHECKED }))).toBe(true);
    });

    it("IS_UNCHECKED returns true when value is false", () => {
      const record = makeRecord("prop-1", PropertyType.CHECKBOX, false);
      expect(matchesFilter(record, filter({ operator: FilterOperator.IS_UNCHECKED }))).toBe(true);
    });

    it("IS_CHECKED returns false when value is false", () => {
      const record = makeRecord("prop-1", PropertyType.CHECKBOX, false);
      expect(matchesFilter(record, filter({ operator: FilterOperator.IS_CHECKED }))).toBe(false);
    });
  });

  describe("SELECT", () => {
    const record = makeRecord("prop-1", PropertyType.SELECT, "option-a");

    it("EQUALS returns true for matching value", () => {
      expect(matchesFilter(record, filter({ operator: FilterOperator.EQUALS, value: "option-a" }))).toBe(true);
    });

    it("NOT_EQUALS returns true for different value", () => {
      expect(matchesFilter(record, filter({ operator: FilterOperator.NOT_EQUALS, value: "option-b" }))).toBe(true);
    });

    it("IN returns true when value is in list", () => {
      expect(matchesFilter(record, filter({ operator: FilterOperator.IN, values: ["option-a", "option-c"] }))).toBe(
        true,
      );
    });

    it("NOT_IN returns true when value is not in list", () => {
      expect(matchesFilter(record, filter({ operator: FilterOperator.NOT_IN, values: ["option-b", "option-c"] }))).toBe(
        true,
      );
    });

    it("IS_EMPTY returns false for non-empty select", () => {
      expect(matchesFilter(record, filter({ operator: FilterOperator.IS_EMPTY }))).toBe(false);
    });

    it("IS_NOT_EMPTY returns true for non-empty select", () => {
      expect(matchesFilter(record, filter({ operator: FilterOperator.IS_NOT_EMPTY }))).toBe(true);
    });
  });

  describe("STATUS (stored as {label, color})", () => {
    const record = makeRecord("prop-1", PropertyType.STATUS, { label: "In Progress", color: "blue" });

    it("EQUALS matches by label case-insensitively", () => {
      expect(matchesFilter(record, filter({ operator: FilterOperator.EQUALS, value: "in progress" }))).toBe(true);
    });

    it("NOT_EQUALS returns true when label differs", () => {
      expect(matchesFilter(record, filter({ operator: FilterOperator.NOT_EQUALS, value: "done" }))).toBe(true);
    });

    it("IN returns true when label is in list", () => {
      expect(matchesFilter(record, filter({ operator: FilterOperator.IN, values: ["in progress", "done"] }))).toBe(
        true,
      );
    });

    it("NOT_IN returns true when label is not in list", () => {
      expect(matchesFilter(record, filter({ operator: FilterOperator.NOT_IN, values: ["done", "cancelled"] }))).toBe(
        true,
      );
    });

    it("IS_EMPTY returns false for non-empty status", () => {
      expect(matchesFilter(record, filter({ operator: FilterOperator.IS_EMPTY }))).toBe(false);
    });

    it("IS_NOT_EMPTY returns true for non-empty status", () => {
      expect(matchesFilter(record, filter({ operator: FilterOperator.IS_NOT_EMPTY }))).toBe(true);
    });
  });

  describe("RELATION", () => {
    const record = makeRecord("prop-1", PropertyType.RELATION, ["record-a", "record-b"]);

    it("CONTAINS returns true when relation includes value", () => {
      expect(matchesFilter(record, filter({ operator: FilterOperator.CONTAINS, value: "record-a" }))).toBe(true);
    });

    it("NOT_CONTAINS returns false when relation includes value", () => {
      expect(matchesFilter(record, filter({ operator: FilterOperator.NOT_CONTAINS, value: "record-a" }))).toBe(false);
    });

    it("IS_EMPTY returns false for non-empty relation", () => {
      expect(matchesFilter(record, filter({ operator: FilterOperator.IS_EMPTY }))).toBe(false);
    });

    it("IS_NOT_EMPTY returns true for non-empty relation", () => {
      expect(matchesFilter(record, filter({ operator: FilterOperator.IS_NOT_EMPTY }))).toBe(true);
    });

    it("IN returns true when any relation value matches filter list", () => {
      expect(matchesFilter(record, filter({ operator: FilterOperator.IN, values: ["record-b", "record-c"] }))).toBe(
        true,
      );
    });

    it("NOT_IN returns true when no relation value matches filter list", () => {
      expect(matchesFilter(record, filter({ operator: FilterOperator.NOT_IN, values: ["record-c", "record-d"] }))).toBe(
        true,
      );
    });
  });

  describe("unknown propertyId", () => {
    it("returns true (passthrough) when propertyId has no matching value", () => {
      const record = makeRecord("prop-1", PropertyType.TEXT, "hello");
      const filterDto = filter({ propertyId: "nonexistent-prop", operator: FilterOperator.EQUALS, value: "anything" });
      expect(matchesFilter(record, filterDto)).toBe(true);
    });
  });
});
