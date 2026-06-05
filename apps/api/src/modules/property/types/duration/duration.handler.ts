import { Injectable } from "@nestjs/common";
import {
  DEFAULT_DURATION_PROPERTY,
  DURATION_FORMAT_VALUES,
  DurationFormat,
  DurationProperty,
  FilterOperator,
  OPERATORS_BY_PROPERTY_TYPE,
  PropertyType,
} from "@fixspace/domain";
import { PropertyConfigHandler, PropertyQueryHandler, PropertyValueHandler } from "../interfaces";

@Injectable()
export class DurationHandler implements PropertyConfigHandler, PropertyValueHandler, PropertyQueryHandler {
  readonly type = PropertyType.DURATION;

  private parseConfig(config: Record<string, unknown>): DurationProperty {
    return config as unknown as DurationProperty;
  }

  getDefaultConfig(): Record<string, unknown> {
    return { ...DEFAULT_DURATION_PROPERTY };
  }

  validateConfig(config: Record<string, unknown>): string[] | null {
    const errors: string[] = [];

    if (config.defaultValue !== undefined && config.defaultValue !== null && typeof config.defaultValue !== "number") {
      errors.push("defaultValue must be a number or null");
    }

    if (config.defaultValue !== undefined && config.defaultValue !== null && (config.defaultValue as number) < 0) {
      errors.push("defaultValue must be >= 0");
    }

    if (config.format !== undefined && !DURATION_FORMAT_VALUES.includes(config.format as DurationFormat)) {
      errors.push(`format must be one of: ${DURATION_FORMAT_VALUES.join(", ")}`);
    }

    return errors.length > 0 ? errors : null;
  }

  validateValue(value: unknown): string[] | null {
    if (value === null) return null;

    if (typeof value !== "number" || Number.isNaN(value)) {
      return ["Duration value must be a non-negative number or null"];
    }

    if (value < 0) {
      return ["Duration value must be >= 0"];
    }

    return null;
  }

  formatValue(value: unknown): unknown {
    if (value === null || value === undefined) return null;
    const parsed = Number(value);
    if (Number.isNaN(parsed) || parsed < 0) return null;
    return Math.floor(parsed);
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
    if (typeof value === "number") return Number.isNaN(value) ? this.getDefaultValue(targetConfig) : Math.max(0, Math.floor(value));
    if (typeof value === "string") {
      const parsed = parseInt(value, 10);
      return Number.isNaN(parsed) ? this.getDefaultValue(targetConfig) : Math.max(0, parsed);
    }
    return this.getDefaultValue(targetConfig);
  }

  getFilterOperators(): FilterOperator[] {
    return OPERATORS_BY_PROPERTY_TYPE[this.type];
  }
}
