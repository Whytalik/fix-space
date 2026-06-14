export enum FilterField {
  PROPERTY = "property",
  CREATED_AT = "createdAt",
  UPDATED_AT = "updatedAt",
}

export enum FilterOperator {
  EQUALS = "equals",
  NOT_EQUALS = "notEquals",
  CONTAINS = "contains",
  NOT_CONTAINS = "notContains",
  STARTS_WITH = "startsWith",
  ENDS_WITH = "endsWith",
  IS_EMPTY = "isEmpty",
  IS_NOT_EMPTY = "isNotEmpty",
  GREATER_THAN = "greaterThan",
  LESS_THAN = "lessThan",
  GREATER_THAN_OR_EQUAL = "greaterThanOrEqual",
  LESS_THAN_OR_EQUAL = "lessThanOrEqual",
  BEFORE = "before",
  AFTER = "after",
  ON_OR_BEFORE = "onOrBefore",
  ON_OR_AFTER = "onOrAfter",
  IS_CHECKED = "isChecked",
  IS_UNCHECKED = "isUnchecked",
  IN = "in",
  NOT_IN = "notIn",
}

export enum FilterLogic {
  AND = "AND",
  OR = "OR",
}

export enum DatePreset {
  TODAY = "today",
  THIS_WEEK = "thisWeek",
  THIS_MONTH = "thisMonth",
  THIS_QUARTER = "thisQuarter",
  THIS_YEAR = "thisYear",
}
