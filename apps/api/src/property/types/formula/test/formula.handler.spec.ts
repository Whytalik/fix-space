import 'reflect-metadata';
import { beforeEach, describe, expect, it } from "@jest/globals";
import { FORMULA_OUTPUT_TYPE_VALUES } from "@nucleus/domain";
import { FormulaHandler } from "../formula.handler";

describe("FormulaHandler", () => {
  let handler: FormulaHandler;

  beforeEach(() => {
    handler = new FormulaHandler();
  });

  describe("getDefaultConfig", () => {
    it("should return a default config with output.type", () => {
      const config = handler.getDefaultConfig();
      expect(config).toBeDefined();
      expect((config.output as any).type).toBe("text");
    });
  });

  describe("validateConfig", () => {
    it("should return null for empty config", () => {
      expect(handler.validateConfig({})).toBeNull();
    });

    it("should return error when formula is not a string", () => {
      const errors = handler.validateConfig({ formula: 123 });
      expect(errors).not.toBeNull();
      expect(errors).toContain("formula must be a string");
    });

    it("should return null when formula is a string", () => {
      expect(handler.validateConfig({ formula: "SUM(a, b)" })).toBeNull();
    });

    it("should return error when output is not an object", () => {
      const errors = handler.validateConfig({ output: "bad" });
      expect(errors).not.toBeNull();
      expect(errors).toContain("output must be an object");
    });

    it("should return error when output.type is invalid", () => {
      const errors = handler.validateConfig({ output: { type: "bad_type" } });
      expect(errors).not.toBeNull();
      expect(errors![0]).toContain("output.type must be one of");
    });

    it("should return null when output.type is a valid type", () => {
      expect(handler.validateConfig({ output: { type: FORMULA_OUTPUT_TYPE_VALUES[0] } })).toBeNull();
    });

    it("should return error when output.type is relation but relatedEntityId is missing", () => {
      const errors = handler.validateConfig({
        output: { type: "relation", multiple: true },
      });
      expect(errors).not.toBeNull();
      expect(errors!.some((e) => e.includes("relatedEntityId"))).toBe(true);
    });

    it("should return error when output.type is relation but multiple is missing", () => {
      const errors = handler.validateConfig({
        output: { type: "relation", relatedEntityId: "db-123" },
      });
      expect(errors).not.toBeNull();
      expect(errors!.some((e) => e.includes("multiple"))).toBe(true);
    });

    it("should return null for valid relation output", () => {
      expect(
        handler.validateConfig({
          output: { type: "relation", relatedEntityId: "db-123", multiple: true },
        }),
      ).toBeNull();
    });
  });

  describe("validateValue", () => {
    it("should return null for null", () => {
      expect(handler.validateValue(null)).toBeNull();
    });

    it("should return null for undefined", () => {
      expect(handler.validateValue(undefined)).toBeNull();
    });

    it("should return error for any non-null, non-undefined value", () => {
      const errors = handler.validateValue("some value");
      expect(errors).not.toBeNull();
      expect(errors![0]).toContain("read-only");
    });
  });

  describe("formatValue", () => {
    it("should return null for null", () => {
      expect(handler.formatValue(null)).toBeNull();
    });

    it("should return null for undefined", () => {
      expect(handler.formatValue(undefined)).toBeNull();
    });

    it("should return the value as-is when not null", () => {
      expect(handler.formatValue("computed")).toBe("computed");
    });
  });

  describe("getDefaultValue", () => {
    it("should always return null", () => {
      expect(handler.getDefaultValue()).toBeNull();
    });
  });
});
