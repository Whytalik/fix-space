import { PropertyType } from "@fixspace/domain";

export type ConvertResult = { value: unknown; valid: true } | { value: null; valid: false; reason: string };

const TRUTHY = new Set(["true", "1", "yes", "так"]);
const FALSY = new Set(["false", "0", "no", "ні"]);

export function convertCsvValue(raw: string, type: PropertyType): ConvertResult {
  const trimmed = raw.trim();
  if (trimmed === "") return { value: null, valid: true };

  switch (type) {
    case PropertyType.TEXT:
      return { value: trimmed, valid: true };

    case PropertyType.NUMBER: {
      const num = Number(trimmed.replace(",", "."));
      if (isNaN(num)) return { value: null, valid: false, reason: `"${trimmed}" is not a number` };
      return { value: num, valid: true };
    }

    case PropertyType.CHECKBOX: {
      const lower = trimmed.toLowerCase();
      if (TRUTHY.has(lower)) return { value: true, valid: true };
      if (FALSY.has(lower)) return { value: false, valid: true };
      return { value: null, valid: false, reason: `"${trimmed}" is not a valid checkbox value (use true/false, 1/0, yes/no)` };
    }

    case PropertyType.DATE: {
      const date = new Date(trimmed);
      if (isNaN(date.getTime())) return { value: null, valid: false, reason: `"${trimmed}" is not a valid date` };
      return { value: date.toISOString(), valid: true };
    }

    case PropertyType.DURATION: {
      const num = Number(trimmed);
      if (isNaN(num) || num < 0) return { value: null, valid: false, reason: `"${trimmed}" is not a valid duration` };
      return { value: Math.floor(num), valid: true };
    }

    case PropertyType.RATING: {
      const num = parseInt(trimmed, 10);
      if (isNaN(num) || num < 0 || num > 5) return { value: null, valid: false, reason: `"${trimmed}" must be 0–5` };
      return { value: num, valid: true };
    }

    case PropertyType.PROGRESS: {
      const num = parseInt(trimmed, 10);
      if (isNaN(num) || num < 0 || num > 100) return { value: null, valid: false, reason: `"${trimmed}" must be 0–100` };
      return { value: num, valid: true };
    }

    case PropertyType.SELECT:
    case PropertyType.STATUS:
      return { value: trimmed, valid: true };

    default:
      return { value: null, valid: false, reason: `Property type ${type} is not supported for CSV import` };
  }
}

function stripHtml(html: string): string {
  return html
    .replace(/<\/p>/gi, "\n")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .trim();
}

export function formatValueForCsv(value: unknown, type?: PropertyType): any {
  if (value === null || value === undefined) return "";

  if (type === PropertyType.DATE) {
    if (typeof value === "string") {
      const date = new Date(value);
      if (!isNaN(date.getTime())) return date.toISOString().slice(0, 10);
    }
    if (value instanceof Date) return value.toISOString().slice(0, 10);
    return value;
  }

  if (type === PropertyType.TEXT && typeof value === "string") {
    return stripHtml(value);
  }

  if (typeof value === "boolean") return value ? "true" : "false";
  if (typeof value === "object") {
    if (value instanceof Date) return value.toISOString();
    return JSON.stringify(value);
  }
  return value;
}
