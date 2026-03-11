import { beforeEach, describe, expect, it } from "@jest/globals";
import { TextHandler } from "../text.handler";

describe("TextHandler", () => {
  let handler: TextHandler;

  beforeEach(() => {
    handler = new TextHandler();
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

    it("should return error when defaultValue is not a string", () => {
      const errors = handler.validateConfig({ defaultValue: 123 });
      expect(errors).not.toBeNull();
      expect(errors).toContain("defaultValue must be a string");
    });

    it("should return null when defaultValue is a string", () => {
      expect(handler.validateConfig({ defaultValue: "hello" })).toBeNull();
    });

    it("should return error when isRichText is not a boolean", () => {
      const errors = handler.validateConfig({ isRichText: "yes" });
      expect(errors).not.toBeNull();
      expect(errors).toContain("isRichText must be a boolean");
    });

    it("should return null when isRichText is a boolean", () => {
      expect(handler.validateConfig({ isRichText: true })).toBeNull();
    });

    it("should return error when urlHandling is an invalid value", () => {
      const errors = handler.validateConfig({ urlHandling: "bad_value" });
      expect(errors).not.toBeNull();
      expect(errors![0]).toContain("urlHandling must be one of");
    });

    it("should return multiple errors for multiple invalid fields", () => {
      const errors = handler.validateConfig({ defaultValue: 123, isRichText: "yes" });
      expect(errors).not.toBeNull();
      expect(errors!.length).toBe(2);
    });
  });

  describe("validateValue", () => {
    it("should return null for a string value", () => {
      expect(handler.validateValue("hello")).toBeNull();
    });

    it("should return null for null value", () => {
      expect(handler.validateValue(null)).toBeNull();
    });

    it("should return error for a number value", () => {
      const errors = handler.validateValue(42);
      expect(errors).not.toBeNull();
      expect(errors![0]).toContain("string");
    });

    it("should return error for an object value", () => {
      const errors = handler.validateValue({});
      expect(errors).not.toBeNull();
    });
  });

  describe("formatValue", () => {
    it("should return empty string for null", () => {
      expect(handler.formatValue(null)).toBe("");
    });

    it("should return empty string for undefined", () => {
      expect(handler.formatValue(undefined)).toBe("");
    });

    it("should return the string as-is", () => {
      expect(handler.formatValue("text")).toBe("text");
    });

    it("should convert number to string", () => {
      expect(handler.formatValue(42)).toBe("42");
    });
  });

  describe("getDefaultValue", () => {
    it("should return defaultValue from config when present", () => {
      expect(handler.getDefaultValue({ defaultValue: "hi" })).toBe("hi");
    });

    it("should return empty string when defaultValue is absent", () => {
      expect(handler.getDefaultValue({})).toBe("");
    });
  });
});
