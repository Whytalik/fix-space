import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import type { TestingModule } from "@nestjs/testing";
import { Test } from "@nestjs/testing";

import { PropertyType } from "@fixspace/domain";
import { AppLogger } from "@/common/logger/app-logger.service";
import { AutomationEngine } from "../automation.engine";
import type { RecordForAutomation } from "../automation.engine";

describe("AutomationEngine", () => {
  let engine: AutomationEngine;

  const mockLogger: jest.Mocked<AppLogger> = {
    setContext: jest.fn(),
    debug: jest.fn(),
    log: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  } as unknown as jest.Mocked<AppLogger>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AutomationEngine, { provide: AppLogger, useValue: mockLogger }],
    }).compile();

    engine = module.get<AutomationEngine>(AutomationEngine);
    jest.clearAllMocks();
  });

  describe("evaluateFieldChangeCondition", () => {
    it("TC-AUTO-U-002: should return false when propertyId does not match", () => {
      const result = engine.evaluateFieldChangeCondition({ propertyId: "prop-A" }, "prop-B", null, "new");
      expect(result).toBe(false);
    });

    it("TC-AUTO-U-002: should return true when no condition and propertyId matches", () => {
      const result = engine.evaluateFieldChangeCondition({ propertyId: "prop-A" }, "prop-A", null, "new");
      expect(result).toBe(true);
    });

    it("TC-AUTO-U-002: EQUALS — returns true when newValue equals target value", () => {
      const result = engine.evaluateFieldChangeCondition(
        { propertyId: "p", condition: { type: "equals", value: "Win" } },
        "p",
        "Pending",
        "Win",
      );
      expect(result).toBe(true);
    });

    it("TC-AUTO-U-002: EQUALS — returns false when newValue does not match", () => {
      const result = engine.evaluateFieldChangeCondition(
        { propertyId: "p", condition: { type: "equals", value: "Win" } },
        "p",
        null,
        "Loss",
      );
      expect(result).toBe(false);
    });

    it("TC-AUTO-U-002: BECOMES_SET — true when value goes from empty to non-empty", () => {
      expect(engine.evaluateFieldChangeCondition({ propertyId: "p", condition: { type: "becomes_set" } }, "p", null, "2025-01-01")).toBe(
        true,
      );
    });

    it("TC-AUTO-U-002: BECOMES_SET — false when value was already set", () => {
      expect(engine.evaluateFieldChangeCondition({ propertyId: "p", condition: { type: "becomes_set" } }, "p", "old", "new")).toBe(false);
    });

    it("TC-AUTO-U-002: BECOMES_UNSET — true when value goes from set to empty", () => {
      expect(engine.evaluateFieldChangeCondition({ propertyId: "p", condition: { type: "becomes_unset" } }, "p", "some value", null)).toBe(
        true,
      );
    });
  });

  describe("resolveValue", () => {
    const record: RecordForAutomation = {
      id: "rec-1",
      databaseId: "db-1",
      values: [{ propertyId: "prop-date", value: "2025-01-15" }],
    };

    it("TC-AUTO-U-002: FIXED — returns the literal value", () => {
      expect(engine.resolveValue({ valueType: "FIXED", value: "Win" }, record)).toBe("Win");
    });

    it("TC-AUTO-U-002: TODAY — returns ISO date string (YYYY-MM-DD)", () => {
      const result = engine.resolveValue({ valueType: "TODAY" }, record);
      expect(typeof result).toBe("string");
      expect(String(result)).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });

    it("TC-AUTO-U-002: FIELD_REF — returns value from trigger record", () => {
      const result = engine.resolveValue({ valueType: "FIELD_REF", fieldRef: "prop-date" }, record);
      expect(result).toBe("2025-01-15");
    });

    it("TC-AUTO-U-002: FIELD_REF — returns null when field is missing", () => {
      const result = engine.resolveValue({ valueType: "FIELD_REF", fieldRef: "missing-prop" }, record);
      expect(result).toBeNull();
    });

    it("TC-AUTO-U-002: FIELD_REF — returns null when no trigger record provided", () => {
      const result = engine.resolveValue({ valueType: "FIELD_REF", fieldRef: "prop-date" });
      expect(result).toBeNull();
    });
  });

  describe("shouldSkipFilters", () => {
    const record: RecordForAutomation = {
      id: "rec-1",
      databaseId: "db-1",
      values: [
        { propertyId: "date-from", value: "2025-01-01" },
        { propertyId: "date-to", value: null },
      ],
    };

    it("TC-AUTO-U-002: returns true when a FIELD_REF filter points to empty field", () => {
      const filters = [{ propertyId: "x", operator: "EQUALS", valueType: "FIELD_REF", fieldRef: "date-to" }];
      expect(engine.shouldSkipFilters(filters, record)).toBe(true);
    });

    it("TC-AUTO-U-002: returns true for BETWEEN when fieldRefEnd is empty", () => {
      const filters = [{ propertyId: "x", operator: "between", valueType: "FIELD_REF", fieldRef: "date-from", fieldRefEnd: "date-to" }];
      expect(engine.shouldSkipFilters(filters, record)).toBe(true);
    });

    it("TC-AUTO-U-002: returns false when all referenced fields are populated", () => {
      const recordFull: RecordForAutomation = {
        id: "r",
        databaseId: "d",
        values: [
          { propertyId: "date-from", value: "2025-01-01" },
          { propertyId: "date-to", value: "2025-01-07" },
        ],
      };
      const filters = [{ propertyId: "x", operator: "between", valueType: "FIELD_REF", fieldRef: "date-from", fieldRefEnd: "date-to" }];
      expect(engine.shouldSkipFilters(filters, recordFull)).toBe(false);
    });
  });

  describe("isTypeCompatible", () => {
    it("TC-AUTO-U-002: FORMULA target is never writable", () => {
      expect(engine.isTypeCompatible(PropertyType.FORMULA, "FIXED")).toBe(false);
      expect(engine.isTypeCompatible(PropertyType.FORMULA, "FIELD_REF")).toBe(false);
    });

    it("TC-AUTO-U-002: TODAY is only compatible with DATE target", () => {
      expect(engine.isTypeCompatible(PropertyType.DATE, "TODAY")).toBe(true);
      expect(engine.isTypeCompatible(PropertyType.TEXT, "TODAY")).toBe(false);
    });

    it("TC-AUTO-U-002: FIXED is incompatible with RELATION", () => {
      expect(engine.isTypeCompatible(PropertyType.RELATION, "FIXED")).toBe(false);
    });

    it("TC-AUTO-U-002: FIELD_REF NUMBER source is compatible with NUMBER, RATING, PROGRESS targets", () => {
      expect(engine.isTypeCompatible(PropertyType.NUMBER, "FIELD_REF", PropertyType.NUMBER)).toBe(true);
      expect(engine.isTypeCompatible(PropertyType.NUMBER, "FIELD_REF", PropertyType.RATING)).toBe(true);
      expect(engine.isTypeCompatible(PropertyType.NUMBER, "FIELD_REF", PropertyType.PROGRESS)).toBe(true);
      expect(engine.isTypeCompatible(PropertyType.TEXT, "FIELD_REF", PropertyType.NUMBER)).toBe(false);
    });
  });
});
