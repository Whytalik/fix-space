import { PropertyType } from "@fixspace/domain";

type SearchableRecord = {
  name?: string | null;
  values: Array<{
    value: unknown;
    property: { type: string };
  }>;
};

export function matchesSearch(record: SearchableRecord, term: string): boolean {
  const lower = term.toLowerCase();

  if (record.name?.toLowerCase().includes(lower)) {
    return true;
  }

  const searchableTypes = new Set<string>([PropertyType.TEXT, PropertyType.SELECT, PropertyType.STATUS, PropertyType.FORMULA]);

  for (const propertyValue of record.values) {
    if (!searchableTypes.has(propertyValue.property.type)) continue;

    const fieldValue = propertyValue.value;
    if (fieldValue === null || fieldValue === undefined) continue;

    if (typeof fieldValue === "string" && fieldValue.toLowerCase().includes(lower)) return true;

    if (Array.isArray(fieldValue)) {
      if (fieldValue.some((item) => typeof item === "string" && item.toLowerCase().includes(lower))) return true;
    }

    if (typeof val === "object" && !Array.isArray(val)) {
      const label = (val as Record<string, unknown>).label;
      if (typeof label === "string" && label.toLowerCase().includes(lower)) return true;
    }
  }

  return false;
}
