import { Injectable } from "@nestjs/common";
import { DEFAULT_CHECKBOX_PROPERTY, FilterOperator, OPERATORS_BY_PROPERTY_TYPE, PropertyType } from "@fixspace/domain";
import { PropertyConfigHandler, PropertyQueryHandler, PropertyValueHandler } from "../interfaces";

@Injectable()
export class CheckboxHandler implements PropertyConfigHandler, PropertyValueHandler, PropertyQueryHandler {
  readonly type = PropertyType.CHECKBOX;

  getDefaultConfig(): Record<string, unknown> {
    return {
      ...DEFAULT_CHECKBOX_PROPERTY,
    };
  }
  validateConfig(config: Record<string, unknown>): string[] | null {
    const errors: string[] = [];

    if (config.defaultValue !== undefined && typeof config.defaultValue !== "boolean") {
      errors.push("defaultValue must be a boolean");
    }

    return errors.length > 0 ? errors : null;
  }

  validateValue(value: unknown): string[] | null {
    if (value !== null && typeof value !== "boolean") {
      return ["Checkbox value must be a boolean or null"];
    }

    return null;
  }

  formatValue(value: unknown): unknown {
    if (value === null || value === undefined) return false;
    return Boolean(value);
  }

  getDefaultValue(config: Record<string, unknown>): unknown {
    return (config.defaultValue as boolean | undefined) ?? false;
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
    if (typeof value === "boolean") return value;
    if (typeof value === "number") return value !== 0;
    if (typeof value === "string") return ["true", "1", "yes"].includes(value.toLowerCase());
    return false;
  }

  getFilterOperators(): FilterOperator[] {
    return OPERATORS_BY_PROPERTY_TYPE[this.type];
  }
}
