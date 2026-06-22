import React from "react";
import { Calendar } from "lucide-react";
import { FilterField, FilterOperator, OPERATORS_BY_PROPERTY_TYPE, PropertyType } from "@fixspace/domain";

export const NO_VALUE_OPERATORS = new Set([
  FilterOperator.IS_EMPTY,
  FilterOperator.IS_NOT_EMPTY,
  FilterOperator.IS_CHECKED,
  FilterOperator.IS_UNCHECKED,
]);

export const MULTI_VALUE_OPERATORS = new Set([FilterOperator.IN, FilterOperator.NOT_IN]);

export type OperatorDef = { value: FilterOperator; label: string };

export function getOperatorLabel(operator: FilterOperator, type: PropertyType): string {
  if (type === PropertyType.DATE && operator === FilterOperator.EQUALS) return "operators.on";
  if (type === PropertyType.SELECT || type === PropertyType.STATUS) {
    if (operator === FilterOperator.EQUALS) return "operators.isExactly";
    if (operator === FilterOperator.NOT_EQUALS) return "operators.isNotExactly";
    if (operator === FilterOperator.IN) return "operators.isOneOf";
    if (operator === FilterOperator.NOT_IN) return "operators.isNotOneOf";
  }
  return `operators.${operator}`;
}

export function getOperators(type: PropertyType): OperatorDef[] {
  const operators = OPERATORS_BY_PROPERTY_TYPE[type] || OPERATORS_BY_PROPERTY_TYPE[PropertyType.TEXT] || [];
  return operators.map((operator) => ({
    value: operator,
    label: getOperatorLabel(operator, type),
  }));
}

export function defaultOperator(type: PropertyType): FilterOperator {
  return getOperators(type)[0]?.value ?? FilterOperator.EQUALS;
}

export const META_OPTIONS = [
  { value: `meta:${FilterField.CREATED_AT}`, label: "createdAt", iconElement: React.createElement(Calendar, { size: 14 }) },
  { value: `meta:${FilterField.UPDATED_AT}`, label: "updatedAt", iconElement: React.createElement(Calendar, { size: 14 }) },
] as const;
