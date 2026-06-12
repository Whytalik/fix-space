import type { ContentSchema } from "@fixspace/domain";

export function normalizeContentSchema(raw: unknown): ContentSchema {
  if (raw && typeof raw === "object" && "rows" in raw && Array.isArray((raw as ContentSchema).rows)) {
    return raw as ContentSchema;
  }
  return { rows: [] };
}
