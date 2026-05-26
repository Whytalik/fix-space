import {
  DEFAULT_CHECKBOX_PROPERTY,
  DEFAULT_DATE_PROPERTY,
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

export const TYPE_META: Record<PropertyType, { label: string; description: string }> = {
  [PropertyType.TEXT]: { label: "Text", description: "Short or long text, URLs, rich content" },
  [PropertyType.NUMBER]: { label: "Number", description: "Integer, decimal, currency or %" },
  [PropertyType.DATE]: { label: "Date", description: "Date with optional time component" },
  [PropertyType.CHECKBOX]: { label: "Checkbox", description: "Boolean true / false value" },
  [PropertyType.SELECT]: { label: "Select", description: "Pick from predefined options" },
  [PropertyType.STATUS]: { label: "Status", description: "Workflow status with colour coding" },
  [PropertyType.RELATION]: { label: "Relation", description: "Link records to another database" },
  [PropertyType.RATING]: { label: "Rating", description: "1-N star rating" },
  [PropertyType.PROGRESS]: { label: "Progress", description: "0-100% completion" },
  [PropertyType.FORMULA]: { label: "Formula", description: "Calculated field" },
  [PropertyType.DURATION]: { label: "Duration", description: "Time duration in hours/minutes" },
  [PropertyType.BUTTON]: { label: "Button", description: "Action button" },
};

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
      return JSON.parse(JSON.stringify(DEFAULT_STATUS_PROPERTY)) as Record<string, unknown>;
    case PropertyType.RELATION:
      return { ...DEFAULT_RELATION_PROPERTY };
    case PropertyType.RATING:
      return { ...DEFAULT_RATING_PROPERTY };
    case PropertyType.PROGRESS:
      return { ...DEFAULT_PROGRESS_PROPERTY };
    case PropertyType.FORMULA:
      return { ...DEFAULT_FORMULA_PROPERTY };
    default:
      return {};
  }
}
