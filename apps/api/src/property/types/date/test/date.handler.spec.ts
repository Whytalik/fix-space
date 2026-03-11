import { beforeEach, describe, expect, it } from "@jest/globals";
import { DateHandler } from "../date.handler";

describe("DateHandler", () => {
  let handler: DateHandler;

  beforeEach(() => {
    handler = new DateHandler();
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

    it("should return null when defaultValue is null", () => {
      expect(handler.validateConfig({ defaultValue: null })).toBeNull();
    });

    it("should return error when defaultValue is an invalid date string", () => {
      const errors = handler.validateConfig({ defaultValue: "not-a-date" });
      expect(errors).not.toBeNull();
      expect(errors![0]).toContain("valid date");
    });

    it("should return null when defaultValue is a valid ISO date string", () => {
      expect(handler.validateConfig({ defaultValue: "2024-01-15" })).toBeNull();
    });

    it("should return error when format is invalid", () => {
      const errors = handler.validateConfig({ format: "bad_format" });
      expect(errors).not.toBeNull();
      expect(errors![0]).toContain("format must be one of");
    });

    it("should return error when includeTime is not a boolean", () => {
      const errors = handler.validateConfig({ includeTime: "yes" });
      expect(errors).not.toBeNull();
      expect(errors).toContain("includeTime must be a boolean");
    });

    it("should return error when timeFormat is invalid", () => {
      const errors = handler.validateConfig({ timeFormat: "bad_time" });
      expect(errors).not.toBeNull();
      expect(errors![0]).toContain("timeFormat must be one of");
    });
  });

  describe("validateValue", () => {
    it("should return null for null", () => {
      expect(handler.validateValue(null)).toBeNull();
    });

    it("should return null for a valid ISO date string", () => {
      expect(handler.validateValue("2024-01-15")).toBeNull();
    });

    it("should return error for a non-string value", () => {
      const errors = handler.validateValue(12345);
      expect(errors).not.toBeNull();
      expect(errors![0]).toContain("ISO date string");
    });

    it("should return error for an invalid date string", () => {
      const errors = handler.validateValue("not-a-date");
      expect(errors).not.toBeNull();
      expect(errors![0]).toContain("valid date");
    });
  });

  describe("formatValue", () => {
    it("should return null for null", () => {
      expect(handler.formatValue(null)).toBeNull();
    });

    it("should return null for undefined", () => {
      expect(handler.formatValue(undefined)).toBeNull();
    });

    it("should return an ISO string for a valid date string", () => {
      const result = handler.formatValue("2024-01-15");
      expect(typeof result).toBe("string");
      expect(result as string).toContain("2024-01-15");
    });

    it("should return null for an invalid date string", () => {
      expect(handler.formatValue("not-a-date")).toBeNull();
    });
  });

  describe("getDefaultValue", () => {
    it("should return defaultValue from config when present", () => {
      expect(handler.getDefaultValue({ defaultValue: "2024-01-01" })).toBe("2024-01-01");
    });

    it("should return null when defaultValue is absent", () => {
      expect(handler.getDefaultValue({})).toBeNull();
    });

    it("should return null when defaultValue is explicitly null", () => {
      expect(handler.getDefaultValue({ defaultValue: null })).toBeNull();
    });
  });
});
