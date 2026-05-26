import { Injectable } from "@nestjs/common";
import { DEFAULT_CHECKBOX_PROPERTY, PropertyType } from "@fixspace/domain";
import { PropertyConfigHandler, PropertyValueHandler } from "../handler.interface";

@Injectable()
export class CheckboxHandler implements PropertyConfigHandler, PropertyValueHandler {
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
}
