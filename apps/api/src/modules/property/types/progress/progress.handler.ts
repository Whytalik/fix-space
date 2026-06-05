import { Injectable } from "@nestjs/common";
import { DEFAULT_PROGRESS_PROPERTY, FilterOperator, OPERATORS_BY_PROPERTY_TYPE, ProgressProperty, PropertyType } from "@fixspace/domain";
import { PropertyConfigHandler, PropertyQueryHandler, PropertyValueHandler } from "../interfaces";

@Injectable()
export class ProgressHandler implements PropertyConfigHandler, PropertyValueHandler, PropertyQueryHandler {
  readonly type = PropertyType.PROGRESS;

  private parseConfig(config: Record<string, unknown>): ProgressProperty {
    return config as unknown as ProgressProperty;
  }

  getDefaultConfig(): Record<string, unknown> {
    return { ...DEFAULT_PROGRESS_PROPERTY };
  }

  validateConfig(config: Record<string, unknown>): string[] | null {
    const errors: string[] = [];

    if (config.defaultValue !== undefined && config.defaultValue !== null && typeof config.defaultValue !== "number") {
      errors.push("defaultValue must be a number or null");
    }

    if (config.min !== undefined && typeof config.min !== "number") {
      errors.push("min must be a number");
    }

    if (config.max !== undefined && typeof config.max !== "number") {
      errors.push("max must be a number");
    }

    const min = (config.min as number | undefined) ?? DEFAULT_PROGRESS_PROPERTY.min;
    const max = (config.max as number | undefined) ?? DEFAULT_PROGRESS_PROPERTY.max;

    if (typeof config.min === "number" && typeof config.max === "number" && min >= max) {
      errors.push("max must be greater than min");
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

    const { min, max } = this.parseConfig(config);

    if (value < min || value > max) {
      return [`Progress value must be between ${min} and ${max}`];
    }

    return null;
  }

  formatValue(value: unknown, config: Record<string, unknown>): unknown {
    if (value === null || value === undefined) return null;
    const numericValue = Number(value);
    if (Number.isNaN(numericValue)) return null;
    const { min, max } = this.parseConfig(config);
    return Math.min(Math.max(min, numericValue), max);
  }

  getDefaultValue(config: Record<string, unknown>): unknown {
    return this.parseConfig(config).defaultValue ?? null;
  }

  isEmpty(value: unknown): boolean {
    return value === null || value === undefined;
  }

  convertFrom(
    value: unknown,
    _fromType: PropertyType,
    _fromConfig: Record<string, unknown>,
    targetConfig: Record<string, unknown>,
  ): unknown {
    if (value === null || value === undefined) return this.getDefaultValue(targetConfig);
    const { min, max } = this.parseConfig(targetConfig);
    let numericValue: number;
    if (typeof value === "number") numericValue = value;
    else if (typeof value === "string") numericValue = parseFloat(value);
    else return this.getDefaultValue(targetConfig);
    if (Number.isNaN(numericValue)) return this.getDefaultValue(targetConfig);
    return Math.min(Math.max(min, numericValue), max);
  }

  getFilterOperators(): FilterOperator[] {
    return OPERATORS_BY_PROPERTY_TYPE[this.type];
  }
}
