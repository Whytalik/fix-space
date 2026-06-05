import type { PropertyType } from "@fixspace/domain";

export interface PropertyValueHandler {
  readonly type: PropertyType;
  validateValue(value: unknown, config: Record<string, unknown>): string[] | null;
  formatValue(value: unknown, config: Record<string, unknown>): unknown;
  getDefaultValue(config: Record<string, unknown>): unknown;
  convertFrom(value: unknown, fromType: PropertyType, fromConfig: Record<string, unknown>, toConfig: Record<string, unknown>): unknown;
  isEmpty(value: unknown): boolean;
}
