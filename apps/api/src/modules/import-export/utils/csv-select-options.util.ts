import { PropertyType } from "@fixspace/domain";

interface SelectCategory {
  options: Array<{ value: string }>;
}

interface StatusCategory {
  options: Array<{ name: string }>;
}

export function extractAllowedValues(type: PropertyType, config: unknown): string[] {
  if (!config || typeof config !== "object") return [];

  if (type === PropertyType.SELECT) {
    const categories = (config as { categories?: SelectCategory[] }).categories ?? [];
    return categories.flatMap((cat) => cat.options?.map((option) => option.value) ?? []);
  }

  if (type === PropertyType.STATUS) {
    const categories = (config as { categories?: StatusCategory[] }).categories ?? [];
    return categories.flatMap((cat) => cat.options?.map((option) => option.name) ?? []);
  }

  return [];
}
