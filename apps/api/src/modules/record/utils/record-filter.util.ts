import { type Prisma } from "@fixspace/database";
import type { RecordFilterDto } from "@fixspace/domain";
import { FilterField, FilterOperator, PropertyType } from "@fixspace/domain";

export type RecordWithValues = Prisma.RecordGetPayload<{
  include: {
    values: { include: { property: { select: { type: true; position: true } } } };
  };
}>;

function isValidDate(date: Date | null): boolean {
  return date !== null && !isNaN(date.getTime());
}

function compareDates(dateValue: Date | null, filterDateValue: Date | null, operator: FilterOperator): boolean {
  if (!isValidDate(dateValue) || !isValidDate(filterDateValue)) return false;
  const dateTimestamp = dateValue!.getTime();
  const filterTimestamp = filterDateValue!.getTime();
  switch (operator) {
    case FilterOperator.EQUALS:
      return dateTimestamp === filterTimestamp;
    case FilterOperator.NOT_EQUALS:
      return dateTimestamp !== filterTimestamp;
    case FilterOperator.BEFORE:
      return dateTimestamp < filterTimestamp;
    case FilterOperator.AFTER:
      return dateTimestamp > filterTimestamp;
    case FilterOperator.ON_OR_BEFORE:
      return dateTimestamp <= filterTimestamp;
    case FilterOperator.ON_OR_AFTER:
      return dateTimestamp >= filterTimestamp;
    default:
      return true;
  }
}

function checkEmpty(rawValue: unknown): boolean {
  const resolved =
    rawValue !== null && typeof rawValue === "object" && !Array.isArray(rawValue)
      ? ((rawValue as Record<string, unknown>).label ?? null)
      : rawValue;
  return resolved === null || resolved === "" || (Array.isArray(resolved) && resolved.length === 0);
}

export function getPropertyValue(record: RecordWithValues, propertyId: string): unknown {
  const propertyValue = record.values.find((pv) => pv.propertyId === propertyId);
  if (!propertyValue) return null;
  const value = propertyValue.value;
  const isBlank = value === null || value === "" || (typeof value === "string" && value.trim() === "");
  if (propertyValue.property.position === 0 && isBlank) {
    return record.name ?? null;
  }
  return propertyValue.value ?? null;
}

export function getPropertyType(record: RecordWithValues, propertyId: string): string | null {
  const propertyValue = record.values.find((pv) => pv.propertyId === propertyId);
  return propertyValue?.property.type ?? null;
}

export function matchesFilter(record: RecordWithValues, filter: RecordFilterDto): boolean {
  const { operator, value, values } = filter;

  if (filter.field === FilterField.CREATED_AT || filter.field === FilterField.UPDATED_AT) {
    const metaDate = filter.field === FilterField.CREATED_AT ? record.createdAt : record.updatedAt;
    const dateValue = metaDate ?? null;
    const filterDateValue = value !== null ? new Date(String(value)) : null;
    switch (operator) {
      case FilterOperator.IS_EMPTY:
        return dateValue === null;
      case FilterOperator.IS_NOT_EMPTY:
        return dateValue !== null;
      default:
        return compareDates(dateValue, filterDateValue, operator);
    }
  }

  const propertyId = filter.propertyId as string;
  const rawValue = getPropertyValue(record, propertyId);
  const propertyType = getPropertyType(record, propertyId);

  if (propertyType === null) return true;

  const isEmpty = checkEmpty(rawValue);

  switch (propertyType) {
    case PropertyType.TEXT:
    case PropertyType.FORMULA: {
      const textValue = rawValue !== null ? String(rawValue).toLowerCase() : "";
      const filterTextValue = value !== null ? String(value).toLowerCase() : "";
      switch (operator) {
        case FilterOperator.EQUALS:
          return textValue === filterTextValue;
        case FilterOperator.NOT_EQUALS:
          return textValue !== filterTextValue;
        case FilterOperator.CONTAINS:
          return textValue.includes(filterTextValue);
        case FilterOperator.NOT_CONTAINS:
          return !textValue.includes(filterTextValue);
        case FilterOperator.STARTS_WITH:
          return textValue.startsWith(filterTextValue);
        case FilterOperator.ENDS_WITH:
          return textValue.endsWith(filterTextValue);
        case FilterOperator.IS_EMPTY:
          return isEmpty;
        case FilterOperator.IS_NOT_EMPTY:
          return !isEmpty;
        default:
          return true;
      }
    }

    case PropertyType.NUMBER: {
      const numericValue = rawValue !== null ? Number(rawValue) : null;
      const filterNumericValue = value !== null ? Number(value) : null;
      switch (operator) {
        case FilterOperator.EQUALS:
          return numericValue === filterNumericValue;
        case FilterOperator.NOT_EQUALS:
          return numericValue !== filterNumericValue;
        case FilterOperator.GREATER_THAN:
          return numericValue !== null && filterNumericValue !== null && numericValue > filterNumericValue;
        case FilterOperator.LESS_THAN:
          return numericValue !== null && filterNumericValue !== null && numericValue < filterNumericValue;
        case FilterOperator.GREATER_THAN_OR_EQUAL:
          return numericValue !== null && filterNumericValue !== null && numericValue >= filterNumericValue;
        case FilterOperator.LESS_THAN_OR_EQUAL:
          return numericValue !== null && filterNumericValue !== null && numericValue <= filterNumericValue;
        case FilterOperator.IS_EMPTY:
          return isEmpty;
        case FilterOperator.IS_NOT_EMPTY:
          return !isEmpty;
        default:
          return true;
      }
    }

    case PropertyType.DATE: {
      const dateValue = rawValue !== null ? new Date(rawValue as string) : null;
      const filterDateValue = value !== null ? new Date(String(value)) : null;
      const isEmpty = checkEmpty(rawValue);
      switch (operator) {
        case FilterOperator.IS_EMPTY:
          return isEmpty;
        case FilterOperator.IS_NOT_EMPTY:
          return !isEmpty;
        default:
          return compareDates(dateValue, filterDateValue, operator);
      }
    }

    case PropertyType.CHECKBOX: {
      const isChecked = Boolean(rawValue);
      switch (operator) {
        case FilterOperator.IS_CHECKED:
          return isChecked;
        case FilterOperator.IS_UNCHECKED:
          return !isChecked;
        default:
          return true;
      }
    }

    case PropertyType.SELECT:
    case PropertyType.STATUS: {
      const resolvedRaw =
        rawValue !== null && typeof rawValue === "object" && !Array.isArray(rawValue)
          ? ((rawValue as Record<string, unknown>).label ?? "")
          : rawValue;
      const selectValue = resolvedRaw !== null ? String(resolvedRaw).toLowerCase() : "";
      const filterSelectValue = value !== null ? String(value).toLowerCase() : "";
      const filterValues = (values ?? []).map((val) => val.toLowerCase());
      switch (operator) {
        case FilterOperator.EQUALS:
          return selectValue === filterSelectValue;
        case FilterOperator.NOT_EQUALS:
          return selectValue !== filterSelectValue;
        case FilterOperator.IN:
          return filterValues.length > 0 && filterValues.includes(selectValue);
        case FilterOperator.NOT_IN:
          return filterValues.length === 0 || !filterValues.includes(selectValue);
        case FilterOperator.IS_EMPTY:
          return isEmpty;
        case FilterOperator.IS_NOT_EMPTY:
          return !isEmpty;
        default:
          return true;
      }
    }

    case PropertyType.RELATION: {
      const relationValues: string[] = Array.isArray(rawValue) ? (rawValue as string[]) : rawValue !== null ? [String(rawValue)] : [];
      const filterRelationValue = value !== null ? String(value) : "";
      const filterValues: string[] = (values as string[] | undefined) ?? [];
      switch (operator) {
        case FilterOperator.CONTAINS:
          return relationValues.includes(filterRelationValue);
        case FilterOperator.NOT_CONTAINS:
          return !relationValues.includes(filterRelationValue);
        case FilterOperator.IS_EMPTY:
          return relationValues.length === 0;
        case FilterOperator.IS_NOT_EMPTY:
          return relationValues.length > 0;
        case FilterOperator.IN:
          return filterValues.length > 0 && filterValues.some((filterVal) => relationValues.includes(filterVal));
        case FilterOperator.NOT_IN:
          return filterValues.length === 0 || !filterValues.some((filterVal) => relationValues.includes(filterVal));
        default:
          return true;
      }
    }

    default:
      return true;
  }
}
