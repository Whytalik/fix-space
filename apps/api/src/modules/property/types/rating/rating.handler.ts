import { Injectable } from "@nestjs/common";
import {
  DEFAULT_RATING_PROPERTY,
  FilterOperator,
  isRatingPropertyConfig,
  OPERATORS_BY_PROPERTY_TYPE,
  PropertyType,
  RatingPropertyConfig,
} from "@fixspace/domain";
import { PropertyConfigHandler, PropertyQueryHandler, PropertyValueHandler } from "../interfaces";

@Injectable()
export class RatingHandler implements PropertyConfigHandler, PropertyValueHandler, PropertyQueryHandler {
  readonly type = PropertyType.RATING;

  private parseConfig(config: Record<string, unknown>): RatingPropertyConfig {
    if (!isRatingPropertyConfig(config)) {
      throw new Error(`Invariant: expected RatingPropertyConfig, got ${JSON.stringify(config)}`);
    }
    return config;
  }

  getDefaultConfig(): Record<string, unknown> {
    return { ...DEFAULT_RATING_PROPERTY };
  }

  validateConfig(config: Record<string, unknown>): string[] | null {
    const errors: string[] = [];

    if (config.defaultValue !== undefined && config.defaultValue !== null && typeof config.defaultValue !== "number") {
      errors.push("defaultValue must be a number or null");
    }

    if (config.maxStars !== undefined) {
      if (typeof config.maxStars !== "number" || !Number.isInteger(config.maxStars) || config.maxStars < 1 || config.maxStars > 10) {
        errors.push("maxStars must be an integer between 1 and 10");
      }
    }

    if (config.allowHalf !== undefined && typeof config.allowHalf !== "boolean") {
      errors.push("allowHalf must be a boolean");
    }

    return errors.length > 0 ? errors : null;
  }

  validateValue(value: unknown, config: Record<string, unknown>): string[] | null {
    if (value === null) return null;

    if (typeof value !== "number" || Number.isNaN(value)) {
      return ["Rating value must be a number or null"];
    }

    const { maxStars, allowHalf } = this.parseConfig(config);

    if (value < 0 || value > maxStars) {
      return [`Rating value must be between 0 and ${maxStars}`];
    }

    if (!allowHalf && !Number.isInteger(value)) {
      return ["Rating value must be a whole number when half-stars are disabled"];
    }

    return null;
  }

  formatValue(value: unknown, config: Record<string, unknown>): unknown {
    if (value === null || value === undefined) return null;
    const numericValue = Number(value);
    if (Number.isNaN(numericValue)) return null;
    const { maxStars, allowHalf } = this.parseConfig(config);
    const clamped = Math.min(Math.max(0, numericValue), maxStars);
    return allowHalf ? Math.round(clamped * 2) / 2 : Math.round(clamped);
  }

  getDefaultValue(config: Record<string, unknown>): unknown {
    return this.parseConfig(config).defaultValue ?? null;
  }

  isEmpty(value: unknown): boolean {
    return value === null || value === undefined;
  }

  convertFrom(value: unknown, fromType: PropertyType, fromConfig: Record<string, unknown>, targetConfig: Record<string, unknown>): unknown {
    if (value === null || value === undefined) return this.getDefaultValue(targetConfig);
    const { maxStars, allowHalf } = this.parseConfig(targetConfig);
    let numericValue: number;
    if (typeof value === "number") numericValue = value;
    else if (typeof value === "string") numericValue = parseFloat(value);
    else return this.getDefaultValue(targetConfig);
    if (Number.isNaN(numericValue)) return this.getDefaultValue(targetConfig);
    const clamped = Math.min(Math.max(0, numericValue), maxStars);
    return allowHalf ? Math.round(clamped * 2) / 2 : Math.round(clamped);
  }

  getFilterOperators(): FilterOperator[] {
    return OPERATORS_BY_PROPERTY_TYPE[this.type];
  }
}
