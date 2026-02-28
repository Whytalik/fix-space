import { Injectable } from "@nestjs/common";
import {
  DEFAULT_STATUS_PROPERTY,
  PropertyType,
  STATUS_CATEGORY_VALUES,
  STATUS_OPTION_COLOR_VALUES,
  StatusCategory,
  StatusCategoryConfig,
  StatusOptionColor,
} from "@nucleus/domain";
import { PropertyTypeHandler } from "../handler.interface";

@Injectable()
export class StatusHandler implements PropertyTypeHandler {
  readonly type = PropertyType.STATUS;

  getDefaultConfig(): Record<string, unknown> {
    return JSON.parse(JSON.stringify(DEFAULT_STATUS_PROPERTY)) as Record<string, unknown>;
  }

  validateConfig(config: Record<string, unknown>): string[] | null {
    const errors: string[] = [];

    if (config.defaultOption !== undefined && typeof config.defaultOption !== "string") {
      errors.push("defaultOption must be a string");
    }

    if (config.categories !== undefined) {
      if (!Array.isArray(config.categories)) {
        errors.push("categories must be an array");
      } else {
        (config.categories as unknown[]).forEach((cat, i) => {
          if (typeof cat !== "object" || cat === null) {
            errors.push(`categories[${i}] must be an object`);
            return;
          }

          const c = cat as Record<string, unknown>;

          if (!STATUS_CATEGORY_VALUES.includes(c.category as StatusCategory)) {
            errors.push(`categories[${i}].category must be one of: ${STATUS_CATEGORY_VALUES.join(", ")}`);
          }

          if (typeof c.defaultOption !== "string") {
            errors.push(`categories[${i}].defaultOption must be a string`);
          }

          if (!Array.isArray(c.options)) {
            errors.push(`categories[${i}].options must be an array`);
          } else {
            (c.options as unknown[]).forEach((opt, j) => {
              if (typeof opt !== "object" || opt === null) {
                errors.push(`categories[${i}].options[${j}] must be an object`);
                return;
              }

              const o = opt as Record<string, unknown>;

              if (typeof o.name !== "string") {
                errors.push(`categories[${i}].options[${j}].name must be a string`);
              }

              if (!STATUS_OPTION_COLOR_VALUES.includes(o.color as StatusOptionColor)) {
                errors.push(`categories[${i}].options[${j}].color must be a valid status color`);
              }
            });
          }
        });
      }
    }

    return errors.length > 0 ? errors : null;
  }

  validateValue(value: unknown, config: Record<string, unknown>): string[] | null {
    if (value === null) return null;

    if (typeof value !== "string") {
      return ["Status value must be a string or null"];
    }

    const categories = config.categories as StatusCategoryConfig[] | undefined;
    if (categories) {
      const allOptions = categories.flatMap((c) => c.options.map((o) => o.name));
      if (!allOptions.includes(value)) {
        return [`Status value must be one of: ${allOptions.join(", ")}`];
      }
    }

    return null;
  }

  formatValue(value: unknown, config: Record<string, unknown>): unknown {
    if (value === null || value === undefined) return this.getDefaultValue(config);
    return value;
  }

  getDefaultValue(config: Record<string, unknown>): unknown {
    return (config.defaultOption as string | undefined) ?? DEFAULT_STATUS_PROPERTY.defaultOption;
  }
}
