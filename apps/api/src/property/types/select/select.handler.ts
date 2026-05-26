import { Injectable } from "@nestjs/common";
import { DEFAULT_SELECT_PROPERTY, PropertyType, SelectCategory, SelectOption, SelectProperty } from "@fixspace/domain";
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
        for (const rawCategory of config.categories as unknown[]) {
          const category = rawCategory as SelectCategory;
          if (typeof category.label !== "string") {
            errors.push("each category must have a string label");
          }
          if (!Array.isArray(category.options)) {
            errors.push("each category must have an options array");
          } else {
            for (const rawOption of category.options as unknown[]) {
              if (typeof rawOption === "string") continue; // backward compat
              if (
                typeof rawOption !== "object" ||
                rawOption === null ||
                typeof (rawOption as SelectOption).value !== "string"
              ) {
                errors.push("each option must be an object with a string value");
              } else {
                if (
                  (rawOption as SelectOption).color !== undefined &&
                  typeof (rawOption as SelectOption).color !== "string"
                ) {
                  errors.push("option color must be a string");
                }
                if (
                  (rawOption as SelectOption).icon !== undefined &&
                  typeof (rawOption as SelectOption).icon !== "string"
                ) {
                  errors.push("option icon must be a string");
                }
              }
            }
          }
        }
      }
    }

    return errors.length > 0 ? errors : null;
  }

  validateValue(value: unknown, config: Record<string, unknown>): string[] | null {
    if (value === null) return null;

    const { categories, isMultiSelect: isMulti } = this.parseConfig(config);

    const allOptions = categories
      ? categories.flatMap((category) =>
          category.options.map((option) => (typeof option === "string" ? option : option.value)),
        )
      : [];

    function extractLabel(v: unknown): string | null {
      if (typeof v === "string") return v;
      if (typeof v === "object" && v !== null && typeof (v as Record<string, unknown>).label === "string") {
        return (v as Record<string, unknown>).label as string;
      }
      return null;
    }

    if (isMulti) {
      if (!Array.isArray(value)) {
        return ["Multi-select value must be an array or null"];
      }

      const labels: string[] = [];
      for (const val of value as unknown[]) {
        const label = extractLabel(val);
        if (label === null) {
          return ["Multi-select values must be strings or { label, color? } objects"];
        }
        labels.push(label);
      }

      if (allOptions.length > 0) {
        const invalid = labels.filter((entry) => !allOptions.includes(entry));
        if (invalid.length > 0) {
          return [`Invalid options: ${invalid.join(", ")}. Must be one of: ${allOptions.join(", ")}`];
        }
      }
    } else {
      const label = extractLabel(value);
      if (label === null) {
        return ["Select value must be a string, { label, color? } object, or null"];
      }

      if (allOptions.length > 0 && !allOptions.includes(label)) {
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
