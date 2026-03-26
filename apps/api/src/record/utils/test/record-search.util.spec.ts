import "reflect-metadata";
import { describe, expect, it } from "@jest/globals";
import { PropertyType } from "@nucleus/domain";
import { matchesSearch } from "../record-search.util";

type SearchableRecord = Parameters<typeof matchesSearch>[0];

function makeRecord(name: string | null, values: SearchableRecord["values"] = []): SearchableRecord {
  return { name, values };
}

function makeValue(type: string, value: unknown): SearchableRecord["values"][number] {
  return { value, property: { type } };
}

describe("matchesSearch", () => {
  describe("name match", () => {
    it("returns true when name contains the term", () => {
      const record = makeRecord("My Record");
      expect(matchesSearch(record, "record")).toBe(true);
    });

    it("is case-insensitive", () => {
      const record = makeRecord("Hello World");
      expect(matchesSearch(record, "HELLO")).toBe(true);
    });

    it("returns false when name does not match", () => {
      const record = makeRecord("Unrelated", []);
      expect(matchesSearch(record, "xyz")).toBe(false);
    });
  });

  describe("TEXT property", () => {
    it("returns true when TEXT value matches", () => {
      const record = makeRecord(null, [makeValue(PropertyType.TEXT, "some content")]);
      expect(matchesSearch(record, "content")).toBe(true);
    });

    it("returns false when TEXT value does not match", () => {
      const record = makeRecord(null, [makeValue(PropertyType.TEXT, "other")]);
      expect(matchesSearch(record, "missing")).toBe(false);
    });
  });

  describe("SELECT property", () => {
    it("returns true when SELECT value matches", () => {
      const record = makeRecord(null, [makeValue(PropertyType.SELECT, "option-a")]);
      expect(matchesSearch(record, "option")).toBe(true);
    });
  });

  describe("STATUS property ({label, color})", () => {
    it("returns true when STATUS label matches", () => {
      const record = makeRecord(null, [makeValue(PropertyType.STATUS, { label: "In Progress", color: "blue" })]);
      expect(matchesSearch(record, "progress")).toBe(true);
    });

    it("does not match on color", () => {
      const record = makeRecord(null, [makeValue(PropertyType.STATUS, { label: "Done", color: "green" })]);
      expect(matchesSearch(record, "green")).toBe(false);
    });
  });

  describe("FORMULA property", () => {
    it("returns true when FORMULA string value matches", () => {
      const record = makeRecord(null, [makeValue(PropertyType.FORMULA, "computed-42")]);
      expect(matchesSearch(record, "42")).toBe(true);
    });
  });

  describe("non-searchable types", () => {
    it("NUMBER does not match even if value contains term", () => {
      const record = makeRecord(null, [makeValue(PropertyType.NUMBER, "123")]);
      expect(matchesSearch(record, "123")).toBe(false);
    });

    it("DATE does not match", () => {
      const record = makeRecord(null, [makeValue(PropertyType.DATE, "2024-06-15")]);
      expect(matchesSearch(record, "2024")).toBe(false);
    });

    it("CHECKBOX does not match", () => {
      const record = makeRecord(null, [makeValue(PropertyType.CHECKBOX, "true")]);
      expect(matchesSearch(record, "true")).toBe(false);
    });

    it("RELATION does not match", () => {
      const record = makeRecord(null, [makeValue(PropertyType.RELATION, ["record-abc"])]);
      expect(matchesSearch(record, "record-abc")).toBe(false);
    });
  });

  describe("array values", () => {
    it("returns true when any item in array matches", () => {
      const record = makeRecord(null, [makeValue(PropertyType.TEXT, ["hello", "world"])]);
      expect(matchesSearch(record, "world")).toBe(true);
    });

    it("returns false when no item matches", () => {
      const record = makeRecord(null, [makeValue(PropertyType.TEXT, ["hello", "world"])]);
      expect(matchesSearch(record, "xyz")).toBe(false);
    });
  });

  describe("null / undefined values", () => {
    it("skips null value without error", () => {
      const record = makeRecord(null, [makeValue(PropertyType.TEXT, null)]);
      expect(() => matchesSearch(record, "anything")).not.toThrow();
      expect(matchesSearch(record, "anything")).toBe(false);
    });

    it("skips undefined value without error", () => {
      const record = makeRecord(null, [makeValue(PropertyType.TEXT, undefined)]);
      expect(() => matchesSearch(record, "anything")).not.toThrow();
    });
  });

  describe("empty term", () => {
    it("returns true for all records when term is empty string", () => {
      const record = makeRecord("Unrelated record");
      expect(matchesSearch(record, "")).toBe(true);
    });

    it("returns true when name is non-null and term is empty string", () => {
      const record = makeRecord("Any Record", []);
      expect(matchesSearch(record, "")).toBe(true);
    });
  });
});
