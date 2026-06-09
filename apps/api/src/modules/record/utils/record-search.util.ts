import { PropertyType } from "@fixspace/domain";

type SearchableRecord = {
  name?: string | null;
  values: Array<{
    value: unknown;
    property: { type: string };
  }>;
  content?: { content: any } | null;
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

    if (typeof fieldValue === "object" && !Array.isArray(fieldValue)) {
      const label = (fieldValue as Record<string, unknown>).label;
      if (typeof label === "string" && label.toLowerCase().includes(lower)) return true;
    }
  }

  if (record.content?.content) {
    const contentText = extractTextFromJson(record.content.content);
    if (contentText.toLowerCase().includes(lower)) return true;
  }

  return false;
}

function extractTextFromJson(json: any): string {
  if (typeof json === "string") return json;
  if (!json || typeof json !== "object") return "";

  let text = "";

  if (Array.isArray(json)) {
    for (const item of json) {
      text += " " + extractTextFromJson(item);
    }
  } else {
    if (typeof json.text === "string") text += " " + json.text;
    if (typeof json.title === "string") text += " " + json.title;

    for (const key in json) {
      if (key === "text" || key === "title") continue;
      text += " " + extractTextFromJson(json[key]);
    }
  }

  return text.trim();
}
