import type { RecordSortDto} from "@nucleus/domain";
import { SortDirection, SortField } from "@nucleus/domain";
import type { RecordWithValues } from "./record-filter.util";

export function compareRecords(recordA: RecordWithValues, recordB: RecordWithValues, sorts: RecordSortDto[]): number {
  for (const sort of sorts) {
    let valueA: unknown;
    let valueB: unknown;

    if (sort.field === SortField.CREATED_AT) {
      valueA = recordA.createdAt;
      valueB = recordB.createdAt;
    } else if (sort.field === SortField.UPDATED_AT) {
      valueA = recordA.updatedAt;
      valueB = recordB.updatedAt;
    } else if (sort.field === SortField.PROPERTY && sort.propertyId) {
      valueA = recordA.values.find((pv) => pv.propertyId === sort.propertyId)?.value ?? null;
      valueB = recordB.values.find((pv) => pv.propertyId === sort.propertyId)?.value ?? null;
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
  const isNullA = valueA === null;
  const isNullB = valueB === null;

  if (isNullA && isNullB) return 0;
  if (isNullA) return 1;
  if (isNullB) return -1;

  let result = 0;

  if (valueA instanceof Date && valueB instanceof Date) {
    result = valueA.getTime() - valueB.getTime();
  } else if (typeof valueA === "number" && typeof valueB === "number") {
    result = valueA - valueB;
  } else if (typeof valueA === "string" && typeof valueB === "string") {
    result = valueA.localeCompare(valueB);
  } else if (typeof valueA === "boolean" && typeof valueB === "boolean") {
    result = Number(valueA) - Number(valueB);
  } else {
    result = String(valueA).localeCompare(String(valueB));
  }

  return isAscending ? result : -result;
}
