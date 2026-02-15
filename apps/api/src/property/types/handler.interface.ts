import { PropertyType } from "@nucleus/domain";

export interface PropertyTypeHandler {
  type: PropertyType;
  validate(value: unknown): boolean;
  formatValue(value: unknown): unknown;
  getDefaultValue(): unknown;
}
