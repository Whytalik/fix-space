import { Prisma } from "@fixspace/database";

interface FilterUndefinedOptions<T extends Record<string, unknown>, J extends Record<string, unknown>, N extends Record<string, unknown>> {
  fields?: T;
  jsonFields?: J;
  /** Fields where both `null` and `""` (empty string) are coerced to `null` in the DB.
   *  Use this only for optional text fields that the UI clears by sending an empty string. */
  nullableFields?: N;
}

export function filterUndefined<
  T extends Record<string, unknown> = Record<string, never>,
  J extends Record<string, unknown> = Record<string, never>,
  N extends Record<string, unknown> = Record<string, never>,
>(
  options: FilterUndefinedOptions<T, J, N>,
): Partial<T> & Partial<Record<keyof J, Prisma.InputJsonValue | typeof Prisma.JsonNull>> & Partial<{ [K in keyof N]: N[K] | null }> {
  const result: any = {};

  if (options.fields) {
    for (const [key, value] of Object.entries(options.fields)) {
      if (value !== undefined) result[key] = value;
    }
  }

  if (options.jsonFields) {
    for (const [key, value] of Object.entries(options.jsonFields)) {
      if (value === undefined) continue;
      result[key] = value === null ? Prisma.JsonNull : (value as Prisma.InputJsonValue);
    }
  }

  if (options.nullableFields) {
    for (const [key, value] of Object.entries(options.nullableFields)) {
      if (value === undefined) continue;
      result[key] = value === "" || value === null ? null : value;
    }
  }

  return result;
}
