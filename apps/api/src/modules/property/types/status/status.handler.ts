import { Injectable } from "@nestjs/common";
import {
  DEFAULT_STATUS_PROPERTY,
  FilterOperator,
  isStatusPropertyConfig,
  OPERATORS_BY_PROPERTY_TYPE,
  PropertyType,
  STATUS_CATEGORY_VALUES,
  StatusCategory,
  StatusPropertyConfig,
} from "@fixspace/domain";
import { PropertyConfigHandler, PropertyQueryHandler, PropertyValueHandler } from "../interfaces";

@Injectable()
export class StatusHandler implements PropertyConfigHandler, PropertyValueHandler, PropertyQueryHandler {
  readonly type = PropertyType.STATUS;

  private parseConfig(config: Record<string, unknown>): StatusPropertyConfig {
    if (!isStatusPropertyConfig(config)) {
      throw new Error(`Invariant: expected StatusPropertyConfig, got ${JSON.stringify(config)}`);
    }
    return config;
  }

  getDefaultConfig(): Record<string, unknown> {
    return structuredClone(DEFAULT_STATUS_PROPERTY) as Record<string, unknown>;
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
        (config.categories as unknown[]).forEach((rawCategory, i) => {
          if (typeof rawCategory !== "object" || rawCategory === null) {
            errors.push(`categories[${i}] must be an object`);
            return;
          }

          const category = rawCategory as Record<string, unknown>;

          if (!STATUS_CATEGORY_VALUES.includes(category.category as StatusCategory)) {
            errors.push(`categories[${i}].category must be one of: ${STATUS_CATEGORY_VALUES.join(", ")}`);
          }

          if (category.label !== undefined && typeof category.label !== "string") {
            errors.push(`categories[${i}].label must be a string`);
          }

          if (typeof category.defaultOption !== "string") {
            errors.push(`categories[${i}].defaultOption must be a string`);
          }

          if (!Array.isArray(category.options)) {
            errors.push(`categories[${i}].options must be an array`);
          } else {
            (category.options as unknown[]).forEach((option, j) => {
              if (typeof option !== "object" || option === null) {
                errors.push(`categories[${i}].options[${j}] must be an object`);
                return;
              }

              const typedOption = option as Record<string, unknown>;

              if (typeof typedOption.name !== "string") {
                errors.push(`categories[${i}].options[${j}].name must be a string`);
              }

              if (typeof typedOption.color !== "string") {
                errors.push(`categories[${i}].options[${j}].color must be a string`);
              }

              if (typedOption.icon !== undefined && typeof typedOption.icon !== "string") {
                errors.push(`categories[${i}].options[${j}].icon must be a string`);
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

    const { categories } = this.parseConfig(config);
    if (categories) {
      const allOptions = categories.flatMap((category) => category.options.map((option) => option.name));
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
    return this.parseConfig(config).defaultOption ?? DEFAULT_STATUS_PROPERTY.defaultOption;
  }

  isEmpty(value: unknown): boolean {
    return value === null || value === undefined || value === "";
  }

  convertFrom(value: unknown, fromType: PropertyType, fromConfig: Record<string, unknown>, targetConfig: Record<string, unknown>): unknown {
    if (value === null || value === undefined) return this.getDefaultValue(targetConfig);
    const stringValue = typeof value === "string" ? value : String(value);
    const { categories } = this.parseConfig(targetConfig);
    if (categories) {
      const allOptions = categories.flatMap((c) => c.options.map((o) => o.name));
      if (allOptions.includes(stringValue)) return stringValue;
    }
    return this.getDefaultValue(targetConfig);
  }

  getFilterOperators(): FilterOperator[] {
    return OPERATORS_BY_PROPERTY_TYPE[this.type];
  }
}
