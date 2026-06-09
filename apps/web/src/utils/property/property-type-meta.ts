import {
  DEFAULT_CHECKBOX_PROPERTY,
  DEFAULT_DATE_PROPERTY,
  DEFAULT_DURATION_PROPERTY,
  DEFAULT_FORMULA_PROPERTY,
  DEFAULT_NUMBER_PROPERTY,
  DEFAULT_PROGRESS_PROPERTY,
  DEFAULT_RATING_PROPERTY,
  DEFAULT_RELATION_PROPERTY,
  DEFAULT_SELECT_PROPERTY,
  DEFAULT_STATUS_PROPERTY,
  DEFAULT_TEXT_PROPERTY,
  PropertyType,
} from "@fixspace/domain/enums";

export function getTypeMeta(t: (key: string) => string): Record<PropertyType, { label: string; description: string }> {
  return {
    [PropertyType.TEXT]: { label: t("text.label"), description: t("text.description") },
    [PropertyType.NUMBER]: { label: t("number.label"), description: t("number.description") },
    [PropertyType.DATE]: { label: t("date.label"), description: t("date.description") },
    [PropertyType.CHECKBOX]: { label: t("checkbox.label"), description: t("checkbox.description") },
    [PropertyType.SELECT]: { label: t("select.label"), description: t("select.description") },
    [PropertyType.STATUS]: { label: t("status.label"), description: t("status.description") },
    [PropertyType.RELATION]: { label: t("relation.label"), description: t("relation.description") },
    [PropertyType.FORMULA]: { label: t("formula.label"), description: t("formula.description") },
    [PropertyType.DURATION]: { label: t("duration.label"), description: t("duration.description") },
    [PropertyType.RATING]: { label: t("rating.label"), description: t("rating.description") },
    [PropertyType.PROGRESS]: { label: t("progress.label"), description: t("progress.description") },
  };
}

export const TYPE_ORDER: PropertyType[] = [
  PropertyType.TEXT,
  PropertyType.NUMBER,
  PropertyType.DATE,
  PropertyType.CHECKBOX,
  PropertyType.SELECT,
  PropertyType.STATUS,
  PropertyType.RELATION,
  PropertyType.RATING,
  PropertyType.PROGRESS,
  PropertyType.FORMULA,
  PropertyType.DURATION,
];

export function getDefaultConfig(type: PropertyType): Record<string, unknown> {
  switch (type) {
    case PropertyType.TEXT:
      return { ...DEFAULT_TEXT_PROPERTY };
    case PropertyType.NUMBER:
      return { ...DEFAULT_NUMBER_PROPERTY };
    case PropertyType.DATE:
      return { ...DEFAULT_DATE_PROPERTY };
    case PropertyType.CHECKBOX:
      return { ...DEFAULT_CHECKBOX_PROPERTY };
    case PropertyType.SELECT:
      return { ...DEFAULT_SELECT_PROPERTY };
    case PropertyType.STATUS:
      return structuredClone(DEFAULT_STATUS_PROPERTY);
    case PropertyType.RELATION:
      return { ...DEFAULT_RELATION_PROPERTY };
    case PropertyType.RATING:
      return { ...DEFAULT_RATING_PROPERTY };
    case PropertyType.PROGRESS:
      return { ...DEFAULT_PROGRESS_PROPERTY };
    case PropertyType.FORMULA:
      return { ...DEFAULT_FORMULA_PROPERTY };
    case PropertyType.DURATION:
      return { ...DEFAULT_DURATION_PROPERTY };
    default:
      return {};
  }
}
