import { PropertyType } from "@nucleus/domain";

export interface PropertyTypeHandler {
  readonly type: PropertyType;

  // Config operations (Property.config column)
  getDefaultConfig(): Record<string, unknown>;
  validateConfig(config: Record<string, unknown>): string[] | null;

  // Value operations (PropertyValue.value column)
  validateValue(value: unknown, config: Record<string, unknown>): string[] | null;
  formatValue(value: unknown, config: Record<string, unknown>): unknown;
  getDefaultValue(config: Record<string, unknown>): unknown;
}
