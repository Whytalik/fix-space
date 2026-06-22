import type { ContentSchema } from "@fixspace/domain";

export function normalizeContentSchema(content: unknown): ContentSchema {
  if (typeof content === "object" && content !== null && "rows" in content && Array.isArray((content as ContentSchema).rows)) {
    return content as ContentSchema;
  }
  return { rows: [] };
}

export function hasContentRows(content: unknown): content is ContentSchema {
  return normalizeContentSchema(content).rows.length > 0;
}
