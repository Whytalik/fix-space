import { Injectable } from "@nestjs/common";
import {
  DEFAULT_TEXT_PROPERTY,
  FilterOperator,
  isTextPropertyConfig,
  OPERATORS_BY_PROPERTY_TYPE,
  PropertyType,
  TextPropertyConfig,
} from "@fixspace/domain";
import { PropertyConfigHandler, PropertyQueryHandler, PropertyValueHandler } from "../interfaces";

@Injectable()
export class TextHandler implements PropertyConfigHandler, PropertyValueHandler, PropertyQueryHandler {
  readonly type = PropertyType.TEXT;

  private parseConfig(config: Record<string, unknown>): TextPropertyConfig {
    if (!isTextPropertyConfig(config)) {
      throw new Error(`Invariant: expected TextPropertyConfig, got ${JSON.stringify(config)}`);
    }
    return config;
  }

  getDefaultConfig(): Record<string, unknown> {
    return {
      ...DEFAULT_TEXT_PROPERTY,
    };
  }

  validateConfig(config: Record<string, unknown>): string[] | null {
    const errors: string[] = [];

    if (config.defaultValue !== undefined && typeof config.defaultValue !== "string") {
      errors.push("defaultValue must be a string");
    }

    return errors.length > 0 ? errors : null;
  }

  validateValue(value: unknown): string[] | null {
    if (value !== null && typeof value !== "string") {
      return ["Text value must be a string or null"];
    }
    return null;
  }

  formatValue(value: unknown): unknown {
    if (value === null || value === undefined) return "";
    return String(value);
  }

  getDefaultValue(config: Record<string, unknown>): unknown {
    return this.parseConfig(config).defaultValue ?? "";
  }

  isEmpty(value: unknown): boolean {
    return value === null || value === undefined || value === "";
  }

  convertFrom(value: unknown, fromType: PropertyType, fromConfig: Record<string, unknown>, targetConfig: Record<string, unknown>): unknown {
    if (value === null || value === undefined) return this.getDefaultValue(targetConfig);
    if (typeof value === "boolean") return value ? "true" : "false";
    if (typeof value === "number") return String(value);
    if (Array.isArray(value)) {
      return (value as unknown[])
        .map((item) => {
          if (typeof item === "string") return item;
          if (typeof item === "object" && item !== null && typeof (item as Record<string, unknown>).label === "string") {
            return (item as Record<string, unknown>).label as string;
          }
          return String(item);
        })
        .join(", ");
    }
    if (typeof value === "object" && value !== null && typeof (value as Record<string, unknown>).label === "string") {
      return (value as Record<string, unknown>).label as string;
    }
    return String(value);
  }

  getFilterOperators(): FilterOperator[] {
    return OPERATORS_BY_PROPERTY_TYPE[this.type];
  }
}
