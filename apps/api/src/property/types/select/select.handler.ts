import { Injectable } from "@nestjs/common";
import { DEFAULT_SELECT_PROPERTY, SelectCategory, SelectProperty, PropertyType } from "@nucleus/domain";
import { PropertyConfigHandler, PropertyValueHandler } from "../handler.interface";

@Injectable()
export class SelectHandler implements PropertyConfigHandler, PropertyValueHandler {
  readonly type = PropertyType.SELECT;

  private parseConfig(config: Record<string, unknown>): SelectProperty {
    return config as unknown as SelectProperty;
  }

  getDefaultConfig(): Record<string, unknown> {
    return { ...DEFAULT_SELECT_PROPERTY };
  }

  validateConfig(config: Record<string, unknown>): string[] | null {
    const errors: string[] = [];

    if (config.isMultiSelect !== undefined && typeof config.isMultiSelect !== "boolean") {
      errors.push("isMultiSelect must be a boolean");
    }

    if (config.categories !== undefined) {
      if (!Array.isArray(config.categories)) {
        errors.push("categories must be an array");
      } else {
        for (const cat of config.categories as unknown[]) {
          const c = cat as SelectCategory;
          if (typeof c.label !== "string") {
            errors.push("each category must have a string label");
          }
          if (!Array.isArray(c.options)) {
            errors.push("each category must have an options array");
          } else if ((c.options as unknown[]).some((o) => typeof o !== "string")) {
            errors.push("each option must be a string");
          }
        }
      }
    }

    return errors.length > 0 ? errors : null;
  }

  validateValue(value: unknown, config: Record<string, unknown>): string[] | null {
    if (value === null) return null;

    const { categories, isMultiSelect: isMulti } = this.parseConfig(config);

    const allOptions = categories ? categories.flatMap((c) => c.options) : [];

    if (isMulti) {
      if (!Array.isArray(value)) {
        return ["Multi-select value must be an array of strings or null"];
      }

      const arr = value as unknown[];

      if (arr.some((v) => typeof v !== "string")) {
        return ["Multi-select values must be strings"];
      }

      if (allOptions.length > 0) {
        const invalid = (arr as string[]).filter((v) => !allOptions.includes(v));
        if (invalid.length > 0) {
          return [`Invalid options: ${invalid.join(", ")}. Must be one of: ${allOptions.join(", ")}`];
        }
      }
    } else {
      if (typeof value !== "string") {
        return ["Select value must be a string or null"];
      }

      if (allOptions.length > 0 && !allOptions.includes(value)) {
        return [`Value must be one of the defined options: ${allOptions.join(", ")}`];
      }
    }

    return null;
  }

  formatValue(value: unknown, config: Record<string, unknown>): unknown {
    if (value === null || value === undefined) {
      return this.parseConfig(config).isMultiSelect ? [] : null;
    }
    return value;
  }

  getDefaultValue(config: Record<string, unknown>): unknown {
    return this.parseConfig(config).isMultiSelect ? [] : null;
  }
}
