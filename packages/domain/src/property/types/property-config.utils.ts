import type { CheckboxPropertyConfig } from "./checkbox.types";
import type { DatePropertyConfig } from "./date.types";
import { DURATION_FORMAT_VALUES, type DurationFormat, type DurationPropertyConfig } from "./duration.types";
import type { FormulaPropertyConfig } from "./formula.types";
import { NUMBER_FORMAT_VALUES, type NumberFormat, type NumberPropertyConfig } from "./number.types";
import type { ProgressPropertyConfig } from "./progress.types";
import type { RatingPropertyConfig } from "./rating.types";
import type { RelationPropertyConfig } from "./relation.types";
import type { SelectPropertyConfig } from "./select.types";
import type { StatusPropertyConfig } from "./status.types";
import type { TextPropertyConfig } from "./text.types";

export function isTextPropertyConfig(config: unknown): config is TextPropertyConfig {
  return (
    typeof config === "object" &&
    config !== null &&
    "defaultValue" in config &&
    typeof (config as Record<string, unknown>).defaultValue === "string" &&
    !("format" in config)
  );
}

export function isNumberPropertyConfig(config: unknown): config is NumberPropertyConfig {
  return (
    typeof config === "object" &&
    config !== null &&
    "format" in config &&
    "defaultValue" in config &&
    typeof (config as Record<string, unknown>).defaultValue === "number" &&
    NUMBER_FORMAT_VALUES.includes((config as Record<string, unknown>).format as NumberFormat)
  );
}

export function isDatePropertyConfig(config: unknown): config is DatePropertyConfig {
  return typeof config === "object" && config !== null && "includeTime" in config && "timeFormat" in config;
}

export function isCheckboxPropertyConfig(config: unknown): config is CheckboxPropertyConfig {
  return (
    typeof config === "object" &&
    config !== null &&
    "defaultValue" in config &&
    typeof (config as Record<string, unknown>).defaultValue === "boolean"
  );
}

export function isDurationPropertyConfig(config: unknown): config is DurationPropertyConfig {
  return (
    typeof config === "object" &&
    config !== null &&
    "format" in config &&
    DURATION_FORMAT_VALUES.includes((config as Record<string, unknown>).format as DurationFormat)
  );
}

export function isSelectPropertyConfig(config: unknown): config is SelectPropertyConfig {
  return typeof config === "object" && config !== null && "isMultiSelect" in config && "categories" in config;
}

export function isStatusPropertyConfig(config: unknown): config is StatusPropertyConfig {
  return typeof config === "object" && config !== null && "defaultOption" in config && "categories" in config;
}

export function isRelationPropertyConfig(config: unknown): config is RelationPropertyConfig {
  return typeof config === "object" && config !== null && "relatedEntityId" in config && "multiple" in config;
}

export function isFormulaPropertyConfig(config: unknown): config is FormulaPropertyConfig {
  return typeof config === "object" && config !== null && "expression" in config && "resultType" in config;
}

export function isRatingPropertyConfig(config: unknown): config is RatingPropertyConfig {
  return typeof config === "object" && config !== null && "maxStars" in config && "allowHalf" in config;
}

export function isProgressPropertyConfig(config: unknown): config is ProgressPropertyConfig {
  return typeof config === "object" && config !== null && "minValue" in config && "maxValue" in config && "thresholds" in config;
}
