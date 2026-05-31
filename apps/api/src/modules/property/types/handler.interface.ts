import type { PropertyType } from "@fixspace/domain";

export interface PropertyConfigHandler {
  readonly type: PropertyType;
  getDefaultConfig(): Record<string, unknown>;
  validateConfig(config: Record<string, unknown>): string[] | null;
}

export interface PropertyValueHandler {
  readonly type: PropertyType;
  validateValue(value: unknown, config: Record<string, unknown>): string[] | null;
  formatValue(value: unknown, config: Record<string, unknown>): unknown;
  getDefaultValue(config: Record<string, unknown>): unknown;
}
