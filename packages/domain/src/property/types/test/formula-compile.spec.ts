import { compileFormula } from "../formula.compile";
import { FormulaPresetName } from "../formula.types";
import { PropertyType } from "../../property-type.enum";

const ID_A = "11111111-1111-1111-1111-111111111111";
const ID_B = "22222222-2222-2222-2222-222222222222";
const ID_C = "33333333-3333-3333-3333-333333333333";

const key = (id: string) => "field_" + id.replace(/-/g, "_");

describe("compileFormula", () => {
  describe("TC-FMLA-D-001: R_MULTIPLE", () => {
    it("produces pnl / risk expression", () => {
      const result = compileFormula(FormulaPresetName.R_MULTIPLE, { pnl: ID_A, risk: ID_B });
      expect(result.expression).toBe(`${key(ID_A)} / ${key(ID_B)}`);
      expect(result.resultType).toBe(PropertyType.NUMBER);
    });
  });

  describe("TC-FMLA-D-002: PLANNED_RR long", () => {
    it("produces (target - entry) / (entry - stop)", () => {
      const result = compileFormula(FormulaPresetName.PLANNED_RR, {
        entry: ID_A,
        target: ID_B,
        stop: ID_C,
        isShort: false,
      });
      const e = key(ID_A);
      const t = key(ID_B);
      const s = key(ID_C);
      expect(result.expression).toBe(`(${t} - ${e}) / (${e} - ${s})`);
      expect(result.resultType).toBe(PropertyType.NUMBER);
    });
  });

  describe("TC-FMLA-D-003: PLANNED_RR short", () => {
    it("inverts formula for short positions", () => {
      const result = compileFormula(FormulaPresetName.PLANNED_RR, {
        entry: ID_A,
        target: ID_B,
        stop: ID_C,
        isShort: true,
      });
      const e = key(ID_A);
      const t = key(ID_B);
      const s = key(ID_C);
      expect(result.expression).toBe(`(${e} - ${t}) / (${s} - ${e})`);
    });
  });

  describe("TC-FMLA-D-004: RISK_PCT_BALANCE", () => {
    it("produces (risk / balance) * 100", () => {
      const result = compileFormula(FormulaPresetName.RISK_PCT_BALANCE, { risk: ID_A, balance: ID_B });
      expect(result.expression).toBe(`(${key(ID_A)} / ${key(ID_B)}) * 100`);
      expect(result.resultType).toBe(PropertyType.NUMBER);
    });
  });

  describe("TC-FMLA-D-005: PERCENTAGE", () => {
    it("produces (numerator / denominator) * 100", () => {
      const result = compileFormula(FormulaPresetName.PERCENTAGE, { numerator: ID_A, denominator: ID_B });
      expect(result.expression).toBe(`(${key(ID_A)} / ${key(ID_B)}) * 100`);
      expect(result.resultType).toBe(PropertyType.NUMBER);
    });
  });

  describe("TC-FMLA-D-006: AVG_SCORE", () => {
    it("wraps fields in AVG([])", () => {
      const result = compileFormula(FormulaPresetName.AVG_SCORE, { fields: [ID_A, ID_B] });
      expect(result.expression).toBe(`AVG([${key(ID_A)}, ${key(ID_B)}])`);
      expect(result.resultType).toBe(PropertyType.RATING);
    });

    it("returns 0 expression for empty fields", () => {
      const result = compileFormula(FormulaPresetName.AVG_SCORE, { fields: [] });
      expect(result.expression).toBe("0");
    });
  });

  describe("TC-FMLA-D-007: RULE_COMPLIANCE", () => {
    it("produces COUNT_TRUE / N * 100", () => {
      const result = compileFormula(FormulaPresetName.RULE_COMPLIANCE, { fields: [ID_A, ID_B] });
      expect(result.expression).toBe(`COUNT_TRUE([${key(ID_A)}, ${key(ID_B)}]) / 2 * 100`);
      expect(result.resultType).toBe(PropertyType.PROGRESS);
    });
  });

  describe("TC-FMLA-D-008: CONDITIONAL_TEXT", () => {
    it("produces IF(field op value, then, else) for string value", () => {
      const result = compileFormula(FormulaPresetName.CONDITIONAL_TEXT, {
        field: ID_A,
        operator: "==",
        value: "WON",
        thenLabel: "Win",
        elseLabel: "Loss",
      });
      expect(result.expression).toBe(`IF(${key(ID_A)} == 'WON', 'Win', 'Loss')`);
      expect(result.resultType).toBe(PropertyType.TEXT);
    });

    it("inlines numeric value without quotes", () => {
      const result = compileFormula(FormulaPresetName.CONDITIONAL_TEXT, {
        field: ID_A,
        operator: ">",
        value: "100",
        thenLabel: "High",
        elseLabel: "Low",
      });
      expect(result.expression).toBe(`IF(${key(ID_A)} > 100, 'High', 'Low')`);
    });
  });

  describe("TC-FMLA-D-009: CATEGORY_THRESHOLD", () => {
    it("nests IF chains for multiple thresholds", () => {
      const result = compileFormula(FormulaPresetName.CATEGORY_THRESHOLD, {
        field: ID_A,
        thresholds: [
          { threshold: "50", label: "B" },
          { threshold: "80", label: "A" },
        ],
        elseLabel: "C",
      });
      const f = key(ID_A);
      expect(result.expression).toBe(`IF(${f} > 50, 'B', IF(${f} > 80, 'A', 'C'))`);
      expect(result.resultType).toBe(PropertyType.TEXT);
    });
  });

  describe("TC-FMLA-D-010: DATE_DIFF", () => {
    it("produces DATE_DIFF with format", () => {
      const result = compileFormula(FormulaPresetName.DATE_DIFF, {
        date1: ID_A,
        date2: ID_B,
        format: "hours",
      });
      expect(result.expression).toBe(`DATE_DIFF(${key(ID_A)}, ${key(ID_B)}, 'hours')`);
      expect(result.resultType).toBe(PropertyType.DURATION);
    });
  });

  describe("TC-FMLA-D-011: RELATED_RECORDS COUNT", () => {
    it("produces COUNT(relation)", () => {
      const result = compileFormula(FormulaPresetName.RELATED_RECORDS, {
        relation: ID_A,
        operation: "COUNT",
      });
      expect(result.expression).toBe(`COUNT(${key(ID_A)})`);
      expect(result.resultType).toBe(PropertyType.NUMBER);
    });
  });

  describe("TC-FMLA-D-012: RELATED_RECORDS SUM", () => {
    it("produces SUM(MAP(relation, field))", () => {
      const result = compileFormula(FormulaPresetName.RELATED_RECORDS, {
        relation: ID_A,
        operation: "SUM",
        field: ID_B,
      });
      const mapped = `MAP(${key(ID_A)}, '${key(ID_B)}')`;
      expect(result.expression).toBe(`SUM(${mapped})`);
      expect(result.resultType).toBe(PropertyType.NUMBER);
    });
  });

  describe("TC-FMLA-D-013: RELATED_RECORDS EARLIEST", () => {
    it("produces MIN(MAP(...)) with DATE resultType", () => {
      const result = compileFormula(FormulaPresetName.RELATED_RECORDS, {
        relation: ID_A,
        operation: "EARLIEST",
        field: ID_B,
      });
      expect(result.expression).toBe(`MIN(MAP(${key(ID_A)}, '${key(ID_B)}'))`);
      expect(result.resultType).toBe(PropertyType.DATE);
    });
  });
});
