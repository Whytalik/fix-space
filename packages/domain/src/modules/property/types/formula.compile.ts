import { PropertyType } from "../property-type.enum";
import { FormulaPresetName } from "./formula.types";
import { toFieldKey } from "./formula.field-key";

const ALLOWED_COMPARISON_OPERATORS = new Set(["==", "!=", ">", "<", ">=", "<="]);

export interface FormulaCompileResult {
  expression: string;
  resultType: PropertyType;
}

export function compileFormula(presetName: FormulaPresetName, uiState: Record<string, unknown>): FormulaCompileResult {
  switch (presetName) {
    case FormulaPresetName.R_MULTIPLE: {
      const pnl = toFieldKey((uiState.pnl as string) ?? "");
      const risk = toFieldKey((uiState.risk as string) ?? "");
      return { expression: `${pnl} / ${risk}`, resultType: PropertyType.NUMBER };
    }

    case FormulaPresetName.PLANNED_RR: {
      const entryKey = toFieldKey((uiState.entry as string) ?? "");
      const targetKey = toFieldKey((uiState.target as string) ?? "");
      const stopKey = toFieldKey((uiState.stop as string) ?? "");
      const isShort = uiState.isShort === "true" || uiState.isShort === true;
      const expr = isShort
        ? `(${entryKey} - ${targetKey}) / (${stopKey} - ${entryKey})`
        : `(${targetKey} - ${entryKey}) / (${entryKey} - ${stopKey})`;
      return { expression: expr, resultType: PropertyType.NUMBER };
    }

    case FormulaPresetName.RISK_PCT_BALANCE: {
      const risk = toFieldKey((uiState.risk as string) ?? "");
      const balance = toFieldKey((uiState.balance as string) ?? "");
      return { expression: `(${risk} / ${balance}) * 100`, resultType: PropertyType.NUMBER };
    }

    case FormulaPresetName.PERCENTAGE: {
      const numerator = toFieldKey((uiState.numerator as string) ?? "");
      const denominator = toFieldKey((uiState.denominator as string) ?? "");
      return { expression: `(${numerator} / ${denominator}) * 100`, resultType: PropertyType.NUMBER };
    }

    case FormulaPresetName.AVG_SCORE: {
      const fields = (uiState.fields as string[]) ?? [];
      if (fields.length === 0) return { expression: "0", resultType: PropertyType.RATING };
      const keys = fields.map(toFieldKey);
      return { expression: `AVG([${keys.join(", ")}])`, resultType: PropertyType.RATING };
    }

    case FormulaPresetName.RULE_COMPLIANCE: {
      const fields = (uiState.fields as string[]) ?? [];
      if (fields.length === 0) return { expression: "0", resultType: PropertyType.PROGRESS };
      const keys = fields.map(toFieldKey);
      return {
        expression: `COUNT_TRUE([${keys.join(", ")}]) / ${fields.length} * 100`,
        resultType: PropertyType.PROGRESS,
      };
    }

    case FormulaPresetName.CONDITIONAL_TEXT: {
      const field = toFieldKey((uiState.field as string) ?? "");
      const rawOperator = (uiState.operator as string) ?? "==";
      const operator = ALLOWED_COMPARISON_OPERATORS.has(rawOperator) ? rawOperator : "==";
      const rawValue = (uiState.value as string) ?? "";
      const valueExpr = isNaN(Number(rawValue)) ? `'${rawValue.replace(/'/g, "\\'")}'` : rawValue;
      const thenLabel = ((uiState.thenLabel as string) ?? "").replace(/'/g, "\\'");
      const elseLabel = ((uiState.elseLabel as string) ?? "").replace(/'/g, "\\'");
      return {
        expression: `IF(${field} ${operator} ${valueExpr}, '${thenLabel}', '${elseLabel}')`,
        resultType: PropertyType.TEXT,
      };
    }

    case FormulaPresetName.CATEGORY_THRESHOLD: {
      const field = toFieldKey((uiState.field as string) ?? "");
      const thresholds = (uiState.thresholds as Array<{ threshold: string; label: string }>) ?? [];
      const elseLabel = ((uiState.elseLabel as string) ?? "").replace(/'/g, "\\'");

      // Sort descending so the highest threshold is the outermost IF, preventing
      // a lower threshold from short-circuiting a higher one.
      const sorted = [...thresholds].sort((a, b) => Number(b.threshold) - Number(a.threshold));

      let expr = `'${elseLabel}'`;
      for (let i = sorted.length - 1; i >= 0; i--) {
        const row = sorted[i];
        if (!row) continue;
        const safeLabel = row.label.replace(/'/g, "\\'");
        expr = `IF(${field} > ${row.threshold}, '${safeLabel}', ${expr})`;
      }
      return { expression: expr, resultType: PropertyType.TEXT };
    }

    case FormulaPresetName.DATE_DIFF: {
      const date1 = toFieldKey((uiState.date1 as string) ?? "");
      const date2 = toFieldKey((uiState.date2 as string) ?? "");
      const format = (uiState.format as string) ?? "days";
      return {
        expression: `DATE_DIFF(${date1}, ${date2}, '${format}')`,
        resultType: PropertyType.DURATION,
      };
    }

    case FormulaPresetName.RELATED_RECORDS: {
      const relation = toFieldKey((uiState.relation as string) ?? "");
      const operation = (uiState.operation as string) ?? "COUNT";

      if (operation === "COUNT") {
        return { expression: `COUNT(${relation})`, resultType: PropertyType.NUMBER };
      }

      const rawField = (uiState.field as string) ?? "";
      if (!rawField) {
        return { expression: "0", resultType: PropertyType.NUMBER };
      }
      const fieldKey = toFieldKey(rawField);
      const mapped = `MAP(${relation}, '${fieldKey}')`;

      if (operation === "LIST") {
        return { expression: mapped, resultType: PropertyType.TEXT };
      }

      const isDate = operation === "EARLIEST" || operation === "LATEST";
      const fnName = operation === "EARLIEST" ? "MIN" : operation === "LATEST" ? "MAX" : operation;
      return {
        expression: `${fnName}(${mapped})`,
        resultType: isDate ? PropertyType.DATE : PropertyType.NUMBER,
      };
    }

    default:
      return { expression: "", resultType: PropertyType.TEXT };
  }
}
