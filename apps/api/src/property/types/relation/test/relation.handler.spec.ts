import { beforeEach, describe, expect, it } from "@jest/globals";
import { RelationHandler } from "../relation.handler";

describe("RelationHandler", () => {
  let handler: RelationHandler;

  beforeEach(() => {
    handler = new RelationHandler();
  });

  describe("getDefaultConfig", () => {
    it("should return a default config object", () => {
      const config = handler.getDefaultConfig();
      expect(config).toBeDefined();
      expect(typeof config).toBe("object");
    });
  });

  describe("validateConfig", () => {
    it("should return null for empty config", () => {
      expect(handler.validateConfig({})).toBeNull();
    });

    it("should return error when relatedEntityId is not a string", () => {
      const errors = handler.validateConfig({ relatedEntityId: 123 });
      expect(errors).not.toBeNull();
      expect(errors).toContain("relatedEntityId must be a string");
    });

    it("should return null when relatedEntityId is a string", () => {
      expect(handler.validateConfig({ relatedEntityId: "db-123" })).toBeNull();
    });

    it("should return error when multiple is not a boolean", () => {
      const errors = handler.validateConfig({ multiple: "yes" });
      expect(errors).not.toBeNull();
      expect(errors).toContain("multiple must be a boolean");
    });

    it("should return null when multiple is a boolean", () => {
      expect(handler.validateConfig({ multiple: true })).toBeNull();
    });
  });

  describe("validateValue", () => {
    it("should return null for null", () => {
      expect(handler.validateValue(null, {})).toBeNull();
    });

    it("should return null for a string ID in single mode", () => {
      expect(handler.validateValue("record-123", { multiple: false })).toBeNull();
    });

    it("should return error for non-string in single mode", () => {
      const errors = handler.validateValue(42, { multiple: false });
      expect(errors).not.toBeNull();
      expect(errors![0]).toContain("string ID");
    });

    it("should return null for a valid array of IDs in multiple mode", () => {
      expect(handler.validateValue(["id-1", "id-2"], { multiple: true })).toBeNull();
    });

    it("should return error for non-array in multiple mode", () => {
      const errors = handler.validateValue("id-1", { multiple: true });
      expect(errors).not.toBeNull();
      expect(errors![0]).toContain("array");
    });

    it("should return error when array contains non-string IDs in multiple mode", () => {
      const errors = handler.validateValue([1, 2], { multiple: true });
      expect(errors).not.toBeNull();
      expect(errors![0]).toContain("strings");
    });
  });

  describe("formatValue", () => {
    it("should return null for null in single mode", () => {
      expect(handler.formatValue(null, { multiple: false })).toBeNull();
    });

    it("should return empty array for null in multiple mode", () => {
      expect(handler.formatValue(null, { multiple: true })).toEqual([]);
    });

    it("should return the value as-is when not null", () => {
      expect(handler.formatValue("record-123", { multiple: false })).toBe("record-123");
    });
  });

  describe("getDefaultValue", () => {
    it("should return null for single mode", () => {
      expect(handler.getDefaultValue({ multiple: false })).toBeNull();
    });

    it("should return empty array for multiple mode", () => {
      expect(handler.getDefaultValue({ multiple: true })).toEqual([]);
    });

    it("should return null when multiple is absent", () => {
      expect(handler.getDefaultValue({})).toBeNull();
    });
  });
});
