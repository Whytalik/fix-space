import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import type { AppLogger } from "@/common/logger/app-logger.service";
import { FormulaEngine } from "../formula-engine.service";

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

describe("FormulaEngine", () => {
  let engine: FormulaEngine;

  const mockLogger: jest.Mocked<AppLogger> = {
    setContext: jest.fn(),
    debug: jest.fn(),
    log: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  } as unknown as jest.Mocked<AppLogger>;

  beforeEach(() => {
    engine = new FormulaEngine(mockLogger);
    jest.clearAllMocks();
  });

  const evaluate = (expression: string, ctx: Record<string, unknown> = {}, resultType = "NUMBER") =>
    engine.evaluate({ type: "PRESET", expression, resultType } as never, ctx);

  describe("TC-FMLA-U-001: binary arithmetic", () => {
    it("adds two numbers", () => {
      expect(evaluate("a + b", { a: 3, b: 4 })).toBe(7);
    });

    it("subtracts", () => {
      expect(evaluate("a - b", { a: 10, b: 3 })).toBe(7);
    });

    it("multiplies", () => {
      expect(evaluate("a * b", { a: 3, b: 4 })).toBe(12);
    });

    it("divides", () => {
      expect(evaluate("a / b", { a: 10, b: 4 })).toBe(2.5);
    });

    it("returns null on division by zero", () => {
      expect(evaluate("a / b", { a: 5, b: 0 })).toBeNull();
    });

    it("concatenates strings with +", () => {
      expect(evaluate("a + b", { a: "foo", b: "bar" }, "TEXT")).toBe("foobar");
    });
  });

  describe("TC-FMLA-U-002: comparison operators", () => {
    it("== returns true when equal", () => {
      expect(evaluate("a == b", { a: 5, b: 5 }, "CHECKBOX")).toBe(true);
    });

    it("!= returns true when not equal", () => {
      expect(evaluate("a != b", { a: 5, b: 6 }, "CHECKBOX")).toBe(true);
    });

    it("> returns false when equal", () => {
      expect(evaluate("a > b", { a: 5, b: 5 }, "CHECKBOX")).toBe(false);
    });
  });

  describe("TC-FMLA-U-003: ABS", () => {
    it("returns absolute value of negative", () => {
      expect(evaluate("ABS(x)", { x: -7 })).toBe(7);
    });

    it("returns same for positive", () => {
      expect(evaluate("ABS(x)", { x: 3 })).toBe(3);
    });
  });

  describe("TC-FMLA-U-004: ROUND", () => {
    it("rounds to integer", () => {
      expect(evaluate("ROUND(x)", { x: 2.7 })).toBe(3);
    });

    it("rounds to 2 decimal places", () => {
      expect(evaluate("ROUND(x, 2)", { x: 2.567 })).toBe(2.57);
    });
  });

  describe("TC-FMLA-U-005: SUM", () => {
    it("sums array", () => {
      expect(evaluate("SUM([1, 2, 3])")).toBe(6);
    });

    it("returns 0 for empty array", () => {
      expect(evaluate("SUM([])")).toBe(0);
    });
  });

  describe("TC-FMLA-U-006: AVG", () => {
    it("averages array", () => {
      expect(evaluate("AVG([2, 4, 6])")).toBe(4);
    });

    it("returns null for empty array", () => {
      expect(evaluate("AVG([])")).toBeNull();
    });
  });

  describe("TC-FMLA-U-007: COUNT", () => {
    it("counts non-null items", () => {
      expect(evaluate("COUNT(arr)", { arr: [1, null, 3] })).toBe(2);
    });
  });

  describe("TC-FMLA-U-008: MIN / MAX", () => {
    it("MIN returns smallest", () => {
      expect(evaluate("MIN([5, 1, 3])")).toBe(1);
    });

    it("MAX returns largest", () => {
      expect(evaluate("MAX([5, 1, 3])")).toBe(5);
    });

    it("MIN returns null for empty", () => {
      expect(evaluate("MIN([])")).toBeNull();
    });
  });

  describe("TC-FMLA-U-009: COUNT_TRUE", () => {
    it("counts truthy values", () => {
      expect(evaluate("COUNT_TRUE([true, false, true, 0, 1])")).toBe(3);
    });
  });

  describe("TC-FMLA-U-010: IF", () => {
    it("returns consequent when condition is true", () => {
      expect(evaluate("IF(x > 0, 'positive', 'negative')", { x: 5 }, "TEXT")).toBe("positive");
    });

    it("returns alternate when condition is false", () => {
      expect(evaluate("IF(x > 0, 'positive', 'negative')", { x: -1 }, "TEXT")).toBe("negative");
    });
  });

  describe("TC-FMLA-U-011: MAP", () => {
    it("extracts field from array of objects via SUM", () => {
      const rows = [{ field_a: 10 }, { field_a: 20 }];
      expect(evaluate("SUM(MAP(rows, 'field_a'))", { rows })).toBe(30);
    });

    it("averages extracted field via AVG", () => {
      const rows = [{ field_a: 4 }, { field_a: 8 }];
      expect(evaluate("AVG(MAP(rows, 'field_a'))", { rows })).toBe(6);
    });
  });

  describe("TC-FMLA-U-012: DATE_DIFF", () => {
    it("calculates difference in days", () => {
      const d1 = "2024-01-01T00:00:00.000Z";
      const d2 = "2024-01-08T00:00:00.000Z";
      expect(evaluate(`DATE_DIFF(d1, d2, 'days')`, { d1, d2 })).toBe(7);
    });

    it("calculates difference in hours", () => {
      const d1 = "2024-01-01T00:00:00.000Z";
      const d2 = "2024-01-02T00:00:00.000Z";
      expect(evaluate(`DATE_DIFF(d1, d2, 'hours')`, { d1, d2 })).toBe(24);
    });

    it("returns null for invalid dates", () => {
      expect(evaluate("DATE_DIFF(d1, d2, 'days')", { d1: "not-a-date", d2: "2024-01-01" })).toBeNull();
    });
  });

  describe("TC-FMLA-U-013: formatResult", () => {
    it("returns null for missing field", () => {
      expect(evaluate("missing_field", {}, "NUMBER")).toBeNull();
    });

    it("formats NUMBER result as number", () => {
      expect(evaluate("a", { a: 3.14 }, "NUMBER")).toBe(3.14);
    });

    it("formats TEXT result as string", () => {
      expect(evaluate("a", { a: 42 }, "TEXT")).toBe("42");
    });

    it("formats CHECKBOX result as boolean", () => {
      expect(evaluate("a", { a: 1 }, "CHECKBOX")).toBe(true);
    });

    it("returns null when evaluation throws", () => {
      expect(evaluate("UNKNOWN_FN(x)", { x: 1 })).toBeNull();
    });
  });
});
