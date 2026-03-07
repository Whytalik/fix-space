import { beforeEach, describe, expect, it } from "@jest/globals";
import { NumberHandler } from "../number.handler";

describe("NumberHandler", () => {
  let handler: NumberHandler;

  beforeEach(() => {
    handler = new NumberHandler();
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

    it("should return error when defaultValue is not a number", () => {
      const errors = handler.validateConfig({ defaultValue: "x" });
      expect(errors).not.toBeNull();
      expect(errors).toContain("defaultValue must be a number");
    });

    it("should return error when format is invalid", () => {
      const errors = handler.validateConfig({ format: "bad" });
      expect(errors).not.toBeNull();
      expect(errors![0]).toContain("format must be one of");
    });

    it("should return error when decimalPlaces is negative", () => {
      const errors = handler.validateConfig({ decimalPlaces: -1 });
      expect(errors).not.toBeNull();
      expect(errors).toContain("decimalPlaces must be a number between 0 and 10");
    });

    it("should return error when decimalPlaces exceeds 10", () => {
      const errors = handler.validateConfig({ decimalPlaces: 11 });
      expect(errors).not.toBeNull();
      expect(errors).toContain("decimalPlaces must be a number between 0 and 10");
    });

    it("should return null when decimalPlaces is valid", () => {
      expect(handler.validateConfig({ decimalPlaces: 2 })).toBeNull();
    });

    it("should return error when currencySymbol is not a string", () => {
      const errors = handler.validateConfig({ currencySymbol: 5 });
      expect(errors).not.toBeNull();
      expect(errors).toContain("currencySymbol must be a string");
    });
  });

  describe("validateValue", () => {
    it("should return null for null value", () => {
      expect(handler.validateValue(null, {})).toBeNull();
    });

    it("should return error for a non-numeric string", () => {
      const errors = handler.validateValue("bad", {});
      expect(errors).not.toBeNull();
      expect(errors![0]).toContain("number");
    });

    it("should return null for a valid number", () => {
      expect(handler.validateValue(42, {})).toBeNull();
    });

    it("should return error for a float when format is integer", () => {
      const errors = handler.validateValue(3.14, { format: "integer" });
      expect(errors).not.toBeNull();
      expect(errors![0]).toContain("integer");
    });

    it("should return null for an integer when format is integer", () => {
      expect(handler.validateValue(3, { format: "integer" })).toBeNull();
    });
  });

  describe("formatValue", () => {
    it("should return 0 for null", () => {
      expect(handler.formatValue(null, {})).toBe(0);
    });

    it("should return 0 for undefined", () => {
      expect(handler.formatValue(undefined, {})).toBe(0);
    });

    it("should round to integer when format is integer", () => {
      expect(handler.formatValue(3.567, { format: "integer" })).toBe(4);
    });

    it("should round to given decimalPlaces", () => {
      expect(handler.formatValue(3.5678, { decimalPlaces: 2 })).toBe(3.57);
    });

    it("should return the number as-is with no formatting", () => {
      expect(handler.formatValue(42, {})).toBe(42);
    });
  });

  describe("getDefaultValue", () => {
    it("should return defaultValue from config when present", () => {
      expect(handler.getDefaultValue({ defaultValue: 99 })).toBe(99);
    });

    it("should return 0 when defaultValue is absent", () => {
      expect(handler.getDefaultValue({})).toBe(0);
    });
  });
});
