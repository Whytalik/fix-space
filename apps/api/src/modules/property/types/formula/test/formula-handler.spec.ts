import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import type { AppLogger } from "@/common/logger/app-logger.service";
import { FormulaEngine } from "../formula-engine.service";
import { FormulaHandler } from "../formula.handler";

jest.mock("@fixspace/database", () => ({
  PropertyType: {
    TEXT: "TEXT",
    NUMBER: "NUMBER",
    DATE: "DATE",
    CHECKBOX: "CHECKBOX",
    RATING: "RATING",
    PROGRESS: "PROGRESS",
    DURATION: "DURATION",
    SELECT: "SELECT",
    STATUS: "STATUS",
    RELATION: "RELATION",
    FORMULA: "FORMULA",
  },
}));

describe("FormulaHandler", () => {
  let handler: FormulaHandler;

  const mockLogger: jest.Mocked<AppLogger> = {
    setContext: jest.fn(),
    debug: jest.fn(),
    log: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  } as unknown as jest.Mocked<AppLogger>;

  beforeEach(() => {
    const engine = new FormulaEngine(mockLogger);
    handler = new FormulaHandler(engine);
    jest.clearAllMocks();
  });

  const validConfig = {
    type: "PRESET",
    presetName: "R_MULTIPLE",
    expression: "field_a / field_b",
    resultType: "NUMBER",
  };

  describe("TC-FMLA-U-020: validateConfig", () => {
    it("returns null for valid PRESET config", () => {
      expect(handler.validateConfig(validConfig)).toBeNull();
    });

    it("returns null for valid CUSTOM config", () => {
      expect(handler.validateConfig({ type: "CUSTOM", expression: "a + b", resultType: "NUMBER" })).toBeNull();
    });

    it("errors when type is missing", () => {
      const errors = handler.validateConfig({ expression: "a + b", resultType: "NUMBER" });
      expect(errors).not.toBeNull();
      expect(errors!.some((error) => error.includes("type"))).toBe(true);
    });

    it("errors when type is invalid", () => {
      const errors = handler.validateConfig({ type: "INVALID", expression: "a + b", resultType: "NUMBER" });
      expect(errors).not.toBeNull();
      expect(errors!.some((error) => error.includes("type"))).toBe(true);
    });

    it("errors when PRESET config has no presetName", () => {
      const errors = handler.validateConfig({ type: "PRESET", expression: "a + b", resultType: "NUMBER" });
      expect(errors).not.toBeNull();
      expect(errors!.some((error) => error.includes("presetName"))).toBe(true);
    });

    it("errors when PRESET config has invalid presetName", () => {
      const errors = handler.validateConfig({ type: "PRESET", presetName: "INVALID", expression: "a + b", resultType: "NUMBER" });
      expect(errors).not.toBeNull();
      expect(errors!.some((error) => error.includes("presetName"))).toBe(true);
    });

    it("errors when expression is missing", () => {
      const errors = handler.validateConfig({ type: "CUSTOM", resultType: "NUMBER" });
      expect(errors).not.toBeNull();
      expect(errors!.some((error) => error.includes("expression"))).toBe(true);
    });

    it("errors when expression is unparseable", () => {
      const errors = handler.validateConfig({ type: "CUSTOM", expression: "a ??? b", resultType: "NUMBER" });
      expect(errors).not.toBeNull();
      expect(errors!.some((error) => error.includes("expression"))).toBe(true);
    });

    it("errors when resultType is missing", () => {
      const errors = handler.validateConfig({ type: "CUSTOM", expression: "a + b" });
      expect(errors).not.toBeNull();
      expect(errors!.some((error) => error.includes("resultType"))).toBe(true);
    });

    it("errors when resultType is invalid", () => {
      const errors = handler.validateConfig({ type: "CUSTOM", expression: "a + b", resultType: "INVALID" });
      expect(errors).not.toBeNull();
      expect(errors!.some((error) => error.includes("resultType"))).toBe(true);
    });

    it("errors when uiState is not an object", () => {
      const errors = handler.validateConfig({ ...validConfig, uiState: "not-an-object" });
      expect(errors).not.toBeNull();
      expect(errors!.some((error) => error.includes("uiState"))).toBe(true);
    });

    it("accepts uiState as object", () => {
      expect(handler.validateConfig({ ...validConfig, uiState: { pnl: "id-1" } })).toBeNull();
    });
  });

  describe("TC-FMLA-U-021: validateValue", () => {
    it("returns error when value is non-null", () => {
      const errors = handler.validateValue(42);
      expect(errors).not.toBeNull();
      expect(errors!.length).toBeGreaterThan(0);
    });

    it("returns null when value is null", () => {
      expect(handler.validateValue(null)).toBeNull();
    });

    it("returns null when value is undefined", () => {
      expect(handler.validateValue(undefined)).toBeNull();
    });
  });
});
