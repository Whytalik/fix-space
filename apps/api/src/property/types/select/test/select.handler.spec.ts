import { beforeEach, describe, expect, it } from "@jest/globals";
import { SelectHandler } from "../select.handler";

describe("SelectHandler", () => {
  let handler: SelectHandler;

  beforeEach(() => {
    handler = new SelectHandler();
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

    it("should return error when isMultiSelect is not a boolean", () => {
      const errors = handler.validateConfig({ isMultiSelect: "yes" });
      expect(errors).not.toBeNull();
      expect(errors).toContain("isMultiSelect must be a boolean");
    });

    it("should return error when categories is not an array", () => {
      const errors = handler.validateConfig({ categories: "invalid" });
      expect(errors).not.toBeNull();
      expect(errors).toContain("categories must be an array");
    });

    it("should return error when category label is not a string", () => {
      const errors = handler.validateConfig({
        categories: [{ label: 123, options: ["a"] }],
      });
      expect(errors).not.toBeNull();
      expect(errors).toContain("each category must have a string label");
    });

    it("should return error when category options is not an array", () => {
      const errors = handler.validateConfig({
        categories: [{ label: "Cat", options: "not-array" }],
      });
      expect(errors).not.toBeNull();
      expect(errors).toContain("each category must have an options array");
    });

    it("should return error when option is not a valid SelectOption object", () => {
      const errors = handler.validateConfig({
        categories: [{ label: "Cat", options: [1, 2] }],
      });
      expect(errors).not.toBeNull();
      expect(errors).toContain("each option must be an object with a string value");
    });

    it("should return null for valid categories with SelectOption objects", () => {
      expect(
        handler.validateConfig({
          categories: [{ label: "Cat", options: [{ value: "a" }, { value: "b", color: "#6B7280" }] }],
        }),
      ).toBeNull();
    });

    it("should return null for valid categories with plain string options (backward compat)", () => {
      expect(
        handler.validateConfig({
          categories: [{ label: "Cat", options: ["a", "b"] }],
        }),
      ).toBeNull();
    });
  });

  describe("validateValue", () => {
    it("should return null for null", () => {
      expect(handler.validateValue(null, {})).toBeNull();
    });

    it("should return null for a valid string in single-select mode (backward compat)", () => {
      expect(handler.validateValue("option1", {})).toBeNull();
    });

    it("should return null for a valid { label, color? } object in single-select mode", () => {
      expect(handler.validateValue({ label: "option1", color: "#6B7280" }, {})).toBeNull();
    });

    it("should return error for a number in single-select mode", () => {
      const errors = handler.validateValue(42, { isMultiSelect: false });
      expect(errors).not.toBeNull();
    });

    it("should return null for a valid array of strings in multi-select mode (backward compat)", () => {
      expect(handler.validateValue(["a", "b"], { isMultiSelect: true })).toBeNull();
    });

    it("should return null for a valid array of { label, color? } objects in multi-select mode", () => {
      expect(
        handler.validateValue([{ label: "a" }, { label: "b", color: "#6B7280" }], { isMultiSelect: true }),
      ).toBeNull();
    });

    it("should return error for non-array in multi-select mode", () => {
      const errors = handler.validateValue("a", { isMultiSelect: true });
      expect(errors).not.toBeNull();
      expect(errors![0]).toContain("array");
    });

    it("should return error for non-string items in multi-select array", () => {
      const errors = handler.validateValue([1, 2], { isMultiSelect: true });
      expect(errors).not.toBeNull();
    });

    it("should return error when single value is not in defined options (SelectOption config)", () => {
      const config = {
        isMultiSelect: false,
        categories: [{ label: "Cat", options: [{ value: "a" }, { value: "b" }] }],
      };
      const errors = handler.validateValue({ label: "c" }, config);
      expect(errors).not.toBeNull();
    });

    it("should return null when single value is in defined options (SelectOption config)", () => {
      const config = {
        isMultiSelect: false,
        categories: [{ label: "Cat", options: [{ value: "a" }, { value: "b" }] }],
      };
      expect(handler.validateValue({ label: "a" }, config)).toBeNull();
    });

    it("should return error when single value is not in defined options (plain string backward compat)", () => {
      const config = {
        isMultiSelect: false,
        categories: [{ label: "Cat", options: ["a", "b"] }],
      };
      const errors = handler.validateValue("c", config);
      expect(errors).not.toBeNull();
    });

    it("should return null when single value is in defined options (plain string backward compat)", () => {
      const config = {
        isMultiSelect: false,
        categories: [{ label: "Cat", options: ["a", "b"] }],
      };
      expect(handler.validateValue("a", config)).toBeNull();
    });
  });

  describe("formatValue", () => {
    it("should return null for null in single-select mode", () => {
      expect(handler.formatValue(null, { isMultiSelect: false })).toBeNull();
    });

    it("should return empty array for null in multi-select mode", () => {
      expect(handler.formatValue(null, { isMultiSelect: true })).toEqual([]);
    });

    it("should return value as-is when not null", () => {
      expect(handler.formatValue("option1", {})).toBe("option1");
    });
  });

  describe("getDefaultValue", () => {
    it("should return null for single-select", () => {
      expect(handler.getDefaultValue({ isMultiSelect: false })).toBeNull();
    });

    it("should return empty array for multi-select", () => {
      expect(handler.getDefaultValue({ isMultiSelect: true })).toEqual([]);
    });

    it("should return null when isMultiSelect is absent", () => {
      expect(handler.getDefaultValue({})).toBeNull();
    });
  });
});
