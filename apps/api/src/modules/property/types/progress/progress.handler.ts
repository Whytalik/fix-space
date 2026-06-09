import { Injectable } from "@nestjs/common";
import {
  DEFAULT_PROGRESS_PROPERTY,
  FilterOperator,
  isProgressPropertyConfig,
  OPERATORS_BY_PROPERTY_TYPE,
  ProgressPropertyConfig,
  PropertyType,
} from "@fixspace/domain";
import { PropertyConfigHandler, PropertyQueryHandler, PropertyValueHandler } from "../interfaces";

@Injectable()
export class ProgressHandler implements PropertyConfigHandler, PropertyValueHandler, PropertyQueryHandler {
  readonly type = PropertyType.PROGRESS;

  private parseConfig(config: Record<string, unknown>): ProgressPropertyConfig {
    if (!isProgressPropertyConfig(config)) {
      throw new Error(`Invariant: expected ProgressPropertyConfig, got ${JSON.stringify(config)}`);
    }
    return config;
  }

  getDefaultConfig(): Record<string, unknown> {
    return { ...DEFAULT_PROGRESS_PROPERTY };
  }

  validateConfig(config: Record<string, unknown>): string[] | null {
    const errors: string[] = [];

    if (config.defaultValue !== undefined && config.defaultValue !== null && typeof config.defaultValue !== "number") {
      errors.push("defaultValue must be a number or null");
    }

    if (config.minValue !== undefined && typeof config.minValue !== "number") {
      errors.push("minValue must be a number");
    }

    if (config.maxValue !== undefined && typeof config.maxValue !== "number") {
      errors.push("maxValue must be a number");
    }

    const minValue = (config.minValue as number | undefined) ?? DEFAULT_PROGRESS_PROPERTY.minValue;
    const maxValue = (config.maxValue as number | undefined) ?? DEFAULT_PROGRESS_PROPERTY.maxValue;

    if (typeof config.minValue === "number" && typeof config.maxValue === "number" && minValue >= maxValue) {
      errors.push("maxValue must be greater than minValue");
    }

    if (config.step !== undefined) {
      if (typeof config.step !== "number" || config.step <= 0) {
        errors.push("step must be a positive number");
      }
    }

    if (config.showLabel !== undefined && typeof config.showLabel !== "boolean") {
      errors.push("showLabel must be a boolean");
    }

    if (config.thresholds !== undefined && !Array.isArray(config.thresholds)) {
      errors.push("thresholds must be an array");
    }

    return errors.length > 0 ? errors : null;
  }

  validateValue(value: unknown, config: Record<string, unknown>): string[] | null {
    if (value === null) return null;

    if (typeof value !== "number" || Number.isNaN(value)) {
      return ["Progress value must be a number or null"];
    }

    const { minValue, maxValue } = this.parseConfig(config);

    if (value < minValue || value > maxValue) {
      return [`Progress value must be between ${minValue} and ${maxValue}`];
    }

    return null;
  }

  formatValue(value: unknown, config: Record<string, unknown>): unknown {
    if (value === null || value === undefined) return null;
    const numericValue = Number(value);
    if (Number.isNaN(numericValue)) return null;
    const { minValue, maxValue } = this.parseConfig(config);
    return Math.min(Math.max(minValue, numericValue), maxValue);
  }

  getDefaultValue(config: Record<string, unknown>): unknown {
    return this.parseConfig(config).defaultValue ?? null;
  }

  isEmpty(value: unknown): boolean {
    return value === null || value === undefined;
  }

  convertFrom(value: unknown, fromType: PropertyType, fromConfig: Record<string, unknown>, targetConfig: Record<string, unknown>): unknown {
    if (value === null || value === undefined) return this.getDefaultValue(targetConfig);
    const { minValue, maxValue } = this.parseConfig(targetConfig);
    let numericValue: number;
    if (typeof value === "number") numericValue = value;
    else if (typeof value === "string") numericValue = parseFloat(value);
    else return this.getDefaultValue(targetConfig);
    if (Number.isNaN(numericValue)) return this.getDefaultValue(targetConfig);
    return Math.min(Math.max(minValue, numericValue), maxValue);
  }

  getFilterOperators(): FilterOperator[] {
    return OPERATORS_BY_PROPERTY_TYPE[this.type];
  }
}
