import { FilterField, FilterOperator, PropertyType, SortDirection, SortField } from "@fixspace/domain/enums";
import type { RecordResponseDto, RecordFilterDto, RecordSortDto, PropertyResponseDto } from "@fixspace/domain";

export function getPropertyValue(record: RecordResponseDto, propertyId: string): unknown {
  const propertyValue = record.values?.find((entry) => entry.propertyId === propertyId);
  if (!propertyValue) return null;
  return propertyValue.value ?? null;
}

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
  if (rawValue === null || rawValue === undefined || rawValue === "") return true;
  if (Array.isArray(rawValue) && rawValue.length === 0) return true;
  if (typeof rawValue === "object" && !Array.isArray(rawValue)) {
    const obj = rawValue as Record<string, unknown>;
    return obj.label === null || obj.label === "" || obj.value === null || obj.value === "";
  }
  return false;
}

export function matchesFilter(record: RecordResponseDto, filter: RecordFilterDto, properties: PropertyResponseDto[]): boolean {
  const { operator, value, values } = filter;

  if (filter.field === FilterField.CREATED_AT || filter.field === FilterField.UPDATED_AT) {
    const metaDate = filter.field === FilterField.CREATED_AT ? record.createdAt : record.updatedAt;
    const dateValue = metaDate ? new Date(metaDate) : null;
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
  const property = properties.find((p) => p.id === propertyId);
  const propertyType = property?.type;

  if (!propertyType) return true;

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

    case PropertyType.NUMBER:
    case PropertyType.DURATION:
    case PropertyType.RATING:
    case PropertyType.PROGRESS: {
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
      const filterValues = (values ?? []).map((item) => String(item).toLowerCase());
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
          return filterValues.length > 0 && filterValues.some((fv) => relationValues.includes(fv));
        case FilterOperator.NOT_IN:
          return filterValues.length === 0 || !filterValues.some((fv) => relationValues.includes(fv));
        default:
          return true;
      }
    }

    default:
      return true;
  }
}

export function compareRecords(recordA: RecordResponseDto, recordB: RecordResponseDto, sorts: RecordSortDto[]): number {
  for (const sort of sorts) {
    let valueA: unknown;
    let valueB: unknown;

    if (sort.field === SortField.CREATED_AT) {
      valueA = recordA.createdAt ? new Date(recordA.createdAt).getTime() : 0;
      valueB = recordB.createdAt ? new Date(recordB.createdAt).getTime() : 0;
    } else if (sort.field === SortField.UPDATED_AT) {
      valueA = recordA.updatedAt ? new Date(recordA.updatedAt).getTime() : 0;
      valueB = recordB.updatedAt ? new Date(recordB.updatedAt).getTime() : 0;
    } else if (sort.field === SortField.PROPERTY && sort.propertyId) {
      valueA = getPropertyValue(recordA, sort.propertyId);
      valueB = getPropertyValue(recordB, sort.propertyId);
    } else {
      continue;
    }

    const comparison = compareValues(valueA, valueB, sort.direction);
    if (comparison !== 0) return comparison;
  }
  return 0;
}

export function compareValues(valueA: unknown, valueB: unknown, direction: SortDirection): number {
  const isAscending = direction === SortDirection.ASC;
  const isNullA = valueA === null || valueA === undefined || valueA === "";
  const isNullB = valueB === null || valueB === undefined || valueB === "";

  if (isNullA && isNullB) return 0;
  if (isNullA) return 1;
  if (isNullB) return -1;

  let result = 0;

  if (typeof valueA === "number" && typeof valueB === "number") {
    result = valueA - valueB;
  } else if (typeof valueA === "boolean" && typeof valueB === "boolean") {
    result = Number(valueA) - Number(valueB);
  } else {
    result = String(valueA).localeCompare(String(valueB));
  }

  return isAscending ? result : -result;
}
