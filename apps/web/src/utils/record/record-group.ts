import type { RecordGroupDto, RecordResponseDto } from "@fixspace/domain";
import { DateGroupGranularity, GroupField, PropertyType } from "@fixspace/domain/enums";
import type { PropertyResponseDto } from "@fixspace/domain";

export interface RecordGroup {
  key: string;
  label: string;
  records: RecordResponseDto[];
}

const NO_VALUE_KEY = "__no_value__";

function weekStartDate(date: Date, startOfWeek: 0 | 1): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - ((d.getDay() - startOfWeek + 7) % 7));
  return d;
}

function formatDateLabel(date: Date, granularity: DateGroupGranularity, locale = "en", startOfWeek: 0 | 1 = 1): string {
  switch (granularity) {
    case DateGroupGranularity.DAY:
      return date.toISOString().slice(0, 10);
    case DateGroupGranularity.WEEK: {
      const ws = weekStartDate(date, startOfWeek);
      const year = ws.getFullYear();
      const startOfYear = new Date(year, 0, 1);
      const week = Math.ceil(((ws.getTime() - startOfYear.getTime()) / 86400000 + startOfYear.getDay() + 1) / 7);
      return `${year} W${String(week).padStart(2, "0")}`;
    }
    case DateGroupGranularity.MONTH:
      return new Intl.DateTimeFormat(locale, { month: "long", year: "numeric" }).format(date);
    case DateGroupGranularity.YEAR:
      return String(date.getFullYear());
  }
}

function dateSortKey(date: Date, granularity: DateGroupGranularity, startOfWeek: 0 | 1 = 1): string {
  switch (granularity) {
    case DateGroupGranularity.DAY:
      return date.toISOString().slice(0, 10);
    case DateGroupGranularity.WEEK:
      return weekStartDate(date, startOfWeek).toISOString().slice(0, 10);
    case DateGroupGranularity.MONTH:
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    case DateGroupGranularity.YEAR:
      return String(date.getFullYear());
  }
}

function getPropertyType(propertyId: string, properties: PropertyResponseDto[]): PropertyType | null {
  return properties.find((prop) => prop.id === propertyId)?.type ?? null;
}

function extractGroupKey(
  value: unknown,
  type: PropertyType,
  granularity: DateGroupGranularity,
  locale = "en",
  startOfWeek: 0 | 1 = 1,
): { key: string; label: string } | null {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  switch (type) {
    case PropertyType.TEXT: {
      const textValue = String(value).trim();
      if (!textValue) return null;
      return { key: textValue, label: textValue };
    }

    case PropertyType.NUMBER: {
      const numericValue = Number(value);
      if (isNaN(numericValue)) return null;
      const label = String(numericValue);
      return { key: label, label };
    }

    case PropertyType.CHECKBOX: {
      const checked = Boolean(value);
      return checked ? { key: "true", label: "Checked" } : { key: "false", label: "Unchecked" };
    }

    case PropertyType.SELECT: {
      const label =
        typeof value === "object" && value !== null && "label" in value ? String((value as { label: string }).label) : String(value);
      if (!label) return null;
      return { key: label.toLowerCase(), label };
    }

    case PropertyType.STATUS: {
      const label =
        typeof value === "object" && value !== null && "label" in value ? String((value as { label: string }).label) : String(value);
      if (!label) return null;
      return { key: label.toLowerCase(), label };
    }

    case PropertyType.DATE: {
      const date = value instanceof Date ? value : new Date(String(value));
      if (isNaN(date.getTime())) return null;
      return {
        key: dateSortKey(date, granularity, startOfWeek),
        label: formatDateLabel(date, granularity, locale, startOfWeek),
      };
    }

    case PropertyType.RELATION:
      return null;

    default:
      return null;
  }
}

export function groupRecords(
  records: RecordResponseDto[],
  group: RecordGroupDto,
  properties: PropertyResponseDto[],
  locale = "en",
  startOfWeek: 0 | 1 = 1,
): RecordGroup[] {
  const granularity = group.granularity ?? DateGroupGranularity.DAY;
  const groupMap = new Map<string, RecordGroup>();
  const noValueGroup: RecordGroup = {
    key: NO_VALUE_KEY,
    label: "No value",
    records: [],
  };

  for (const record of records) {
    let entry: { key: string; label: string } | null = null;

    if (group.field === GroupField.CREATED_AT) {
      const date = record.createdAt instanceof Date ? record.createdAt : new Date(record.createdAt);
      entry = isNaN(date.getTime())
        ? null
        : { key: dateSortKey(date, granularity, startOfWeek), label: formatDateLabel(date, granularity, locale, startOfWeek) };
    } else if (group.field === GroupField.UPDATED_AT) {
      const date = record.updatedAt instanceof Date ? record.updatedAt : new Date(record.updatedAt);
      entry = isNaN(date.getTime())
        ? null
        : { key: dateSortKey(date, granularity, startOfWeek), label: formatDateLabel(date, granularity, locale, startOfWeek) };
    } else if (group.field === GroupField.PROPERTY && group.propertyId) {
      const propertyValue = record.values?.find((value) => value.propertyId === group.propertyId);
      const type = getPropertyType(group.propertyId, properties);
      if (propertyValue && type) {
        entry = extractGroupKey(propertyValue.value, type, granularity, locale, startOfWeek);
      }
    }

    if (!entry) {
      noValueGroup.records.push(record);
    } else {
      const existing = groupMap.get(entry.key);
      if (existing) {
        existing.records.push(record);
      } else {
        groupMap.set(entry.key, { key: entry.key, label: entry.label, records: [record] });
      }
    }
  }

  const sorted = [...groupMap.values()].sort((a, b) => a.key.localeCompare(b.key));
  if (noValueGroup.records.length > 0) {
    sorted.push(noValueGroup);
  }
  return sorted;
}
