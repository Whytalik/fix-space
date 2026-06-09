import { Injectable } from "@nestjs/common";
import {
  DEFAULT_NUMBER_PROPERTY,
  FilterOperator,
  isNumberPropertyConfig,
  NUMBER_FORMAT_VALUES,
  NumberFormat,
  NumberPropertyConfig,
  OPERATORS_BY_PROPERTY_TYPE,
  PropertyType,
} from "@fixspace/domain";
import { PropertyConfigHandler, PropertyQueryHandler, PropertyValueHandler } from "../interfaces";

@Injectable()
export class NumberHandler implements PropertyConfigHandler, PropertyValueHandler, PropertyQueryHandler {
  readonly type = PropertyType.NUMBER;

  private parseConfig(config: Record<string, unknown>): NumberPropertyConfig {
    if (!isNumberPropertyConfig(config)) {
      throw new Error(`Invariant: expected NumberPropertyConfig, got ${JSON.stringify(config)}`);
    }
    return config;
  }

  getDefaultConfig(): Record<string, unknown> {
    return {
      ...DEFAULT_NUMBER_PROPERTY,
    };
  }

  validateConfig(config: Record<string, unknown>): string[] | null {
    const errors: string[] = [];

    if (config.defaultValue !== undefined && typeof config.defaultValue !== "number") {
      errors.push("defaultValue must be a number");
    }

    if (config.format && !NUMBER_FORMAT_VALUES.includes(config.format as NumberFormat)) {
      errors.push(`format must be one of: ${NUMBER_FORMAT_VALUES.join(", ")}`);
    }

    if (config.decimalPlaces !== undefined) {
      if (typeof config.decimalPlaces !== "number" || config.decimalPlaces < 0 || config.decimalPlaces > 10) {
        errors.push("decimalPlaces must be a number between 0 and 10");
      }
    }

    if (config.currencySymbol !== undefined && typeof config.currencySymbol !== "string") {
      errors.push("currencySymbol must be a string");
    }

    if (config.prefix !== undefined && typeof config.prefix !== "string") {
      errors.push("prefix must be a string");
    }

    if (config.suffix !== undefined && typeof config.suffix !== "string") {
      errors.push("suffix must be a string");
    }

    return errors.length > 0 ? errors : null;
  }

  validateValue(value: unknown): string[] | null {
    if (value === null) return null;

    if (typeof value !== "number" || Number.isNaN(value)) {
      return ["Number value must be a number or null"];
    }

    return null;
  }

  formatValue(value: unknown, config: Record<string, unknown>): unknown {
    if (value === null || value === undefined) return 0;

    const numericValue = Number(value);
    if (Number.isNaN(numericValue)) return 0;

    const { format, decimalPlaces } = this.parseConfig(config);

    if (format === "integer") return Math.round(numericValue);
    if (decimalPlaces !== undefined) return parseFloat(numericValue.toFixed(decimalPlaces));

    return numericValue;
  }

  getDefaultValue(config: Record<string, unknown>): unknown {
    return this.parseConfig(config).defaultValue ?? 0;
  }

  isEmpty(value: unknown): boolean {
    return value === null || value === undefined;
  }

  convertFrom(value: unknown, fromType: PropertyType, fromConfig: Record<string, unknown>, targetConfig: Record<string, unknown>): unknown {
    if (value === null || value === undefined) return this.getDefaultValue(targetConfig);
    if (typeof value === "number") return Number.isNaN(value) ? this.getDefaultValue(targetConfig) : value;
    if (typeof value === "boolean") return value ? 1 : 0;
    if (typeof value === "string") {
      const parsed = parseFloat(value);
      return Number.isNaN(parsed) ? this.getDefaultValue(targetConfig) : parsed;
    }
    return this.getDefaultValue(targetConfig);
  }

  getFilterOperators(): FilterOperator[] {
    return OPERATORS_BY_PROPERTY_TYPE[this.type];
  }
}
