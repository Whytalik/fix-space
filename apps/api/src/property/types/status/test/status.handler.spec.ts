import "reflect-metadata";
import { beforeEach, describe, expect, it } from "@jest/globals";
import { STATUS_CATEGORY_VALUES, STATUS_OPTION_COLOR_VALUES } from "@nucleus/domain";
import { StatusHandler } from "../status.handler";

describe("StatusHandler", () => {
  let handler: StatusHandler;

  const validCategory = {
    category: STATUS_CATEGORY_VALUES[0],
    defaultOption: "Option A",
    options: [{ name: "Option A", color: STATUS_OPTION_COLOR_VALUES[0] }],
  };

  beforeEach(() => {
    handler = new StatusHandler();
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

    it("should return error when defaultOption is not a string", () => {
      const errors = handler.validateConfig({ defaultOption: 123 });
      expect(errors).not.toBeNull();
      expect(errors).toContain("defaultOption must be a string");
    });

    it("should return error when categories is not an array", () => {
      const errors = handler.validateConfig({ categories: "invalid" });
      expect(errors).not.toBeNull();
      expect(errors).toContain("categories must be an array");
    });

    it("should return error when a category has invalid category type", () => {
      const errors = handler.validateConfig({
        categories: [{ category: "bad_cat", defaultOption: "x", options: [] }],
      });
      expect(errors).not.toBeNull();
      expect(errors![0]).toContain("category must be one of");
    });

    it("should return error when a category has no defaultOption string", () => {
      const errors = handler.validateConfig({
        categories: [{ category: STATUS_CATEGORY_VALUES[0], defaultOption: 123, options: [] }],
      });
      expect(errors).not.toBeNull();
      expect(errors![0]).toContain("defaultOption must be a string");
    });

    it("should return error when options is not an array", () => {
      const errors = handler.validateConfig({
        categories: [{ category: STATUS_CATEGORY_VALUES[0], defaultOption: "x", options: "bad" }],
      });
      expect(errors).not.toBeNull();
      expect(errors![0]).toContain("options must be an array");
    });

    it("should return error when option has invalid color", () => {
      const errors = handler.validateConfig({
        categories: [
          {
            category: STATUS_CATEGORY_VALUES[0],
            defaultOption: "x",
            options: [{ name: "x", color: "bad_color" }],
          },
        ],
      });
      expect(errors).not.toBeNull();
      expect(errors![0]).toContain("color must be a valid status color");
    });

    it("should return null for valid categories", () => {
      expect(handler.validateConfig({ categories: [validCategory] })).toBeNull();
    });
  });

  describe("validateValue", () => {
    it("should return null for null", () => {
      expect(handler.validateValue(null, {})).toBeNull();
    });

    it("should return error for a non-string value", () => {
      const errors = handler.validateValue(42, {});
      expect(errors).not.toBeNull();
      expect(errors![0]).toContain("string");
    });

    it("should return null for a string value with no categories defined", () => {
      expect(handler.validateValue("any", {})).toBeNull();
    });

    it("should return null for a valid option from categories", () => {
      const config = { categories: [validCategory] };
      expect(handler.validateValue("Option A", config)).toBeNull();
    });

    it("should return error for a value not in categories", () => {
      const config = { categories: [validCategory] };
      const errors = handler.validateValue("Not An Option", config);
      expect(errors).not.toBeNull();
    });
  });

  describe("formatValue", () => {
    it("should return the default value when value is null", () => {
      const config = handler.getDefaultConfig();
      const result = handler.formatValue(null, config);
      expect(result).toBeDefined();
    });

    it("should return value as-is when not null", () => {
      expect(handler.formatValue("Option A", {})).toBe("Option A");
    });
  });

  describe("getDefaultValue", () => {
    it("should return defaultOption from config when present", () => {
      expect(handler.getDefaultValue({ defaultOption: "My Option" })).toBe("My Option");
    });

    it("should fall back to DEFAULT_STATUS_PROPERTY.defaultOption when absent", () => {
      const result = handler.getDefaultValue({});
      expect(result).toBeDefined();
    });
  });
});
