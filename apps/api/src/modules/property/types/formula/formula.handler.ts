import { Injectable } from "@nestjs/common";
import {
  compileFormula,
  DEFAULT_FORMULA_PROPERTY,
  FilterOperator,
  FormulaPresetName,
  FormulaType,
  OPERATORS_BY_PROPERTY_TYPE,
  PropertyType,
} from "@fixspace/domain";
import { PropertyConfigHandler, PropertyQueryHandler, PropertyValueHandler } from "../interfaces";
import { FormulaEngine } from "./formula-engine.service";

@Injectable()
export class FormulaHandler implements PropertyConfigHandler, PropertyValueHandler, PropertyQueryHandler {
  readonly type = PropertyType.FORMULA;

  constructor(private readonly formulaEngine: FormulaEngine) {}

  getDefaultConfig(): Record<string, unknown> {
    return { ...DEFAULT_FORMULA_PROPERTY };
  }

  validateConfig(config: Record<string, unknown>): string[] | null {
    const errors: string[] = [];

    if (!config.type || !Object.values(FormulaType).includes(config.type as FormulaType)) {
      errors.push(`type must be one of: ${Object.values(FormulaType).join(", ")}`);
    }

    if (config.type === FormulaType.PRESET) {
      if (!config.presetName || !Object.values(FormulaPresetName).includes(config.presetName as FormulaPresetName)) {
        errors.push(`presetName must be one of: ${Object.values(FormulaPresetName).join(", ")}`);
      } else {
        const compiled = compileFormula(config.presetName as FormulaPresetName, (config.uiState as Record<string, unknown>) ?? {});
        config.expression = compiled.expression;
        config.resultType = compiled.resultType;
      }
    }

    if (typeof config.expression !== "string" || !config.expression) {
      errors.push("expression is required and must be a non-empty string");
    } else {
      try {
        this.formulaEngine.validateExpression(config.expression as string);
      } catch (error) {
        errors.push(`Invalid formula expression: ${(error as Error).message}`);
      }
    }

    if (!config.resultType || !Object.values(PropertyType).includes(config.resultType as PropertyType)) {
      errors.push(`resultType must be one of: ${Object.values(PropertyType).join(", ")}`);
    }

    if (config.uiState !== undefined && (typeof config.uiState !== "object" || config.uiState === null)) {
      errors.push("uiState must be an object");
    }

    return errors.length > 0 ? errors : null;
  }

  validateValue(value: unknown): string[] | null {
    if (value !== null && value !== undefined) {
      return ["Formula property values are read-only and cannot be set directly"];
    }
    return null;
  }

  formatValue(value: unknown): unknown {
    return value ?? null;
  }

  getDefaultValue(): unknown {
    return null;
  }

  isEmpty(value: unknown): boolean {
    return value === null || value === undefined;
  }

  convertFrom(): unknown {
    return null;
  }

  getFilterOperators(): FilterOperator[] {
    return OPERATORS_BY_PROPERTY_TYPE[this.type];
  }
}
