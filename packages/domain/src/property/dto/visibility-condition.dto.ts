export type VisibilityOperator = "EQUALS" | "NOT_EQUALS" | "IN" | "NOT_IN" | "CONTAINS" | "EXISTS" | "NOT_EXISTS";

export class VisibilityConditionDto {
  dependsOnPropertyName: string;
  operator: VisibilityOperator;
  value?: unknown;
}
