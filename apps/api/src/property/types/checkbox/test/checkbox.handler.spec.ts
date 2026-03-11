import { beforeEach, describe, expect, it } from "@jest/globals";
import { CheckboxHandler } from "../checkbox.handler";

describe("CheckboxHandler", () => {
  let handler: CheckboxHandler;

  beforeEach(() => {
    handler = new CheckboxHandler();
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

    it("should return error when defaultValue is not a boolean", () => {
      const errors = handler.validateConfig({ defaultValue: "yes" });
      expect(errors).not.toBeNull();
      expect(errors).toContain("defaultValue must be a boolean");
    });

    it("should return null when defaultValue is a boolean", () => {
      expect(handler.validateConfig({ defaultValue: true })).toBeNull();
      expect(handler.validateConfig({ defaultValue: false })).toBeNull();
    });
  });

  describe("validateValue", () => {
    it("should return null for a boolean value", () => {
      expect(handler.validateValue(true)).toBeNull();
      expect(handler.validateValue(false)).toBeNull();
    });

    it("should return null for null", () => {
      expect(handler.validateValue(null)).toBeNull();
    });

    it("should return error for a non-boolean, non-null value", () => {
      const errors = handler.validateValue("true");
      expect(errors).not.toBeNull();
      expect(errors![0]).toContain("boolean");
    });

    it("should return error for a number value", () => {
      const errors = handler.validateValue(1);
      expect(errors).not.toBeNull();
    });
  });

  describe("formatValue", () => {
    it("should return false for null", () => {
      expect(handler.formatValue(null)).toBe(false);
    });

    it("should return false for undefined", () => {
      expect(handler.formatValue(undefined)).toBe(false);
    });

    it("should return true for truthy value", () => {
      expect(handler.formatValue(true)).toBe(true);
    });

    it("should return false for false", () => {
      expect(handler.formatValue(false)).toBe(false);
    });
  });

  describe("getDefaultValue", () => {
    it("should return defaultValue from config when present", () => {
      expect(handler.getDefaultValue({ defaultValue: true })).toBe(true);
    });

    it("should return false when defaultValue is absent", () => {
      expect(handler.getDefaultValue({})).toBe(false);
    });
  });
});
