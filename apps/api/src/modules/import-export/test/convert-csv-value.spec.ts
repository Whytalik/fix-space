import { describe, expect, it } from "@jest/globals";
import { PropertyType } from "@fixspace/domain";
import { convertCsvValue } from "../utils/csv-value-converter.util";

describe("convertCsvValue", () => {
  describe("SELECT / STATUS — broker suffix stripping", () => {
    it("TC-IMP-U-008: should strip .raw suffix and match allowed value", () => {
      const result = convertCsvValue("NZDUSD.raw", PropertyType.SELECT, ["NZDUSD", "EURUSD"]);

      expect(result.valid).toBe(true);
      expect((result as { value: string }).value).toBe("NZDUSD");
    });

    it("TC-IMP-U-009: should strip .pro suffix for STATUS type", () => {
      const result = convertCsvValue("EURUSD.pro", PropertyType.STATUS, ["EURUSD", "GBPUSD"]);

      expect(result.valid).toBe(true);
      expect((result as { value: string }).value).toBe("EURUSD");
    });

    it("TC-IMP-U-010: should return raw value unchanged when no allowed values provided", () => {
      const result = convertCsvValue("GER30.raw", PropertyType.SELECT, []);

      expect(result.valid).toBe(true);
      expect((result as { value: string }).value).toBe("GER30");
    });

    it("TC-IMP-U-011: should match via alias (buy → Long)", () => {
      const result = convertCsvValue("buy", PropertyType.SELECT, ["Long", "Short"]);

      expect(result.valid).toBe(true);
      expect((result as { value: string }).value).toBe("Long");
    });
  });

  describe("NUMBER", () => {
    it("TC-IMP-U-012: should return CSV_VALUE_NOT_A_NUMBER error code for invalid number", () => {
      const result = convertCsvValue("notanumber", PropertyType.NUMBER);

      expect(result.valid).toBe(false);
      if (!result.valid) {
        expect(result.error.code).toBe("CSV_VALUE_NOT_A_NUMBER");
        expect(result.error.args?.value).toBe("notanumber");
      }
    });

    it("TC-IMP-U-013: should parse number with comma decimal separator", () => {
      const result = convertCsvValue("1 234,56", PropertyType.NUMBER);

      expect(result.valid).toBe(true);
      expect((result as { value: number }).value).toBeCloseTo(1234.56);
    });
  });

  describe("DATE", () => {
    it("TC-IMP-U-014: should return CSV_VALUE_NOT_A_DATE error code for invalid date", () => {
      const result = convertCsvValue("notadate", PropertyType.DATE);

      expect(result.valid).toBe(false);
      if (!result.valid) {
        expect(result.error.code).toBe("CSV_VALUE_NOT_A_DATE");
        expect(result.error.args?.value).toBe("notadate");
      }
    });

    it("TC-IMP-U-015: should parse dot-separated date (DD.MM.YYYY)", () => {
      const result = convertCsvValue("2024.01.15", PropertyType.DATE);

      expect(result.valid).toBe(true);
      expect(typeof (result as { value: string }).value).toBe("string");
    });
  });

  describe("CHECKBOX", () => {
    it("TC-IMP-U-016: should return CSV_VALUE_NOT_A_CHECKBOX error code for invalid value", () => {
      const result = convertCsvValue("maybe", PropertyType.CHECKBOX);

      expect(result.valid).toBe(false);
      if (!result.valid) {
        expect(result.error.code).toBe("CSV_VALUE_NOT_A_CHECKBOX");
      }
    });

    it("TC-IMP-U-017: should parse Ukrainian truthy values", () => {
      const result = convertCsvValue("так", PropertyType.CHECKBOX);

      expect(result.valid).toBe(true);
      expect((result as { value: boolean }).value).toBe(true);
    });
  });

  describe("RATING", () => {
    it("TC-IMP-U-018: should return CSV_VALUE_RATING_RANGE error for out-of-range value", () => {
      const result = convertCsvValue("10", PropertyType.RATING);

      expect(result.valid).toBe(false);
      if (!result.valid) {
        expect(result.error.code).toBe("CSV_VALUE_RATING_RANGE");
      }
    });
  });

  describe("PROGRESS", () => {
    it("TC-IMP-U-019: should return CSV_VALUE_PROGRESS_RANGE error for value above 100", () => {
      const result = convertCsvValue("150", PropertyType.PROGRESS);

      expect(result.valid).toBe(false);
      if (!result.valid) {
        expect(result.error.code).toBe("CSV_VALUE_PROGRESS_RANGE");
      }
    });
  });

  describe("header row detection", () => {
    it("TC-IMP-U-020: should return CSV_VALUE_HEADER_ROW error for trading header word", () => {
      const result = convertCsvValue("Symbol", PropertyType.TEXT);

      expect(result.valid).toBe(false);
      if (!result.valid) {
        expect(result.error.code).toBe("CSV_VALUE_HEADER_ROW");
      }
    });
  });

  describe("unsupported type", () => {
    it("TC-IMP-U-021: should return CSV_TYPE_NOT_SUPPORTED for FORMULA type", () => {
      const result = convertCsvValue("=SUM(1,2)", PropertyType.FORMULA);

      expect(result.valid).toBe(false);
      if (!result.valid) {
        expect(result.error.code).toBe("CSV_TYPE_NOT_SUPPORTED");
      }
    });
  });

  describe("empty value", () => {
    it("TC-IMP-U-022: should return null value for empty string (valid)", () => {
      const result = convertCsvValue("", PropertyType.NUMBER);

      expect(result.valid).toBe(true);
      expect(result.value).toBeNull();
    });
  });
});
