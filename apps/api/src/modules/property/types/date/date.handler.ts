import { Injectable } from "@nestjs/common";
import {
  DATA_FORMATS_VALUES,
  DataFormat,
  DEFAULT_DATE_PROPERTY,
  FilterOperator,
  OPERATORS_BY_PROPERTY_TYPE,
  PropertyType,
  TIME_FORMATS_VALUES,
  TimeFormat,
} from "@fixspace/domain";
import { PropertyConfigHandler, PropertyQueryHandler, PropertyValueHandler } from "../interfaces";

@Injectable()
export class DateHandler implements PropertyConfigHandler, PropertyValueHandler, PropertyQueryHandler {
  readonly type = PropertyType.DATE;

  getDefaultConfig(): Record<string, unknown> {
    return {
      ...DEFAULT_DATE_PROPERTY,
    };
  }

  validateConfig(config: Record<string, unknown>): string[] | null {
    const errors: string[] = [];

    if (config.defaultValue !== undefined && config.defaultValue !== null) {
      const date = new Date(config.defaultValue as string);
      if (isNaN(date.getTime())) {
        errors.push("defaultValue must be a valid date string or null");
      }
    }

    if (config.format !== undefined && !DATA_FORMATS_VALUES.includes(config.format as DataFormat)) {
      errors.push(`format must be one of: ${DATA_FORMATS_VALUES.join(", ")}`);
    }

    if (config.includeTime !== undefined && typeof config.includeTime !== "boolean") {
      errors.push("includeTime must be a boolean");
    }

    if (config.timeFormat !== undefined && !TIME_FORMATS_VALUES.includes(config.timeFormat as TimeFormat)) {
      errors.push(`timeFormat must be one of: ${TIME_FORMATS_VALUES.join(", ")}`);
    }

    return errors.length > 0 ? errors : null;
  }

  validateValue(value: unknown): string[] | null {
    if (value === null) return null;

    if (typeof value !== "string") {
      return ["Date value must be an ISO date string or null"];
    }

    const date = new Date(value);
    if (isNaN(date.getTime())) {
      return ["Date value must be a valid date"];
    }

    return null;
  }

  formatValue(value: unknown): unknown {
    if (value === null || value === undefined) return null;

    const date = new Date(value as string);
    if (isNaN(date.getTime())) return null;

    return date.toISOString();
  }

  getDefaultValue(config: Record<string, unknown>): unknown {
    return (config.defaultValue as string | null | undefined) ?? null;
  }

  isEmpty(value: unknown): boolean {
    return value === null || value === undefined;
  }

  convertFrom(value: unknown, _fromType: PropertyType, _fromConfig: Record<string, unknown>, _toConfig: Record<string, unknown>): unknown {
    if (value === null || value === undefined) return null;
    if (typeof value === "string" || typeof value === "number") {
      const parsedDate = new Date(value);
      if (!Number.isNaN(parsedDate.getTime())) return parsedDate.toISOString();
    }
    return null;
  }

  getFilterOperators(): FilterOperator[] {
    return OPERATORS_BY_PROPERTY_TYPE[this.type];
  }
}
