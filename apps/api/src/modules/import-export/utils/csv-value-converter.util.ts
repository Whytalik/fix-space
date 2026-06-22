import { PropertyType } from "@fixspace/domain";

export type ConvertError = { code: string; args?: Record<string, unknown> };
export type ConvertResult = { value: unknown; valid: true } | { value: null; valid: false; error: ConvertError };

const TRUTHY = new Set(["true", "1", "yes", "так"]);
const FALSY = new Set(["false", "0", "no", "ні"]);

const BROKER_SUFFIXES = ["raw", "pro", "ecn", "min", "plus", "zero", "standard", "cent", "micro", "nano", "i", "m", "x", "y", "z"];

function stripBrokerSuffix(raw: string): string {
  const parts = raw.split(/[.\-_]/);
  if (parts.length <= 1) return raw;
  const lastPart = parts[parts.length - 1]?.toLowerCase();
  if (lastPart && BROKER_SUFFIXES.includes(lastPart)) {
    return parts.slice(0, -1).join(".");
  }
  return raw;
}

const SELECT_ALIASES: Record<string, string> = {
  buy: "Long",
  sell: "Short",
  long: "Long",
  short: "Short",
  "buy limit": "Long",
  "buy stop": "Long",
  "buy stop limit": "Long",
  "sell limit": "Short",
  "sell stop": "Short",
  "sell stop limit": "Short",
  купить: "Long",
  продать: "Short",
  покупка: "Long",
  продажа: "Short",
};

const NON_NUMERIC_STATUSES = new Set(["balance", "deposit", "withdrawal", "credit", "bonus", "баланс", "депозит", "снятие", "кредит"]);

function normalizeSelectValue(raw: string, allowedValues: string[]): string {
  const lowerRaw = raw.trim().toLowerCase();

  const exact = allowedValues.find((v) => v.toLowerCase() === lowerRaw);
  if (exact) return exact;

  const alias = SELECT_ALIASES[lowerRaw];
  if (alias && allowedValues.includes(alias)) return alias;

  const partial = allowedValues.find((v) => v.toLowerCase().includes(lowerRaw) || lowerRaw.includes(v.toLowerCase()));
  if (partial) return partial;

  return raw.trim();
}

const TRADING_HEADER_WORDS = new Set([
  "время",
  "time",
  "объем",
  "volume",
  "лот",
  "lot",
  "комиссия",
  "commission",
  "сбор",
  "своп",
  "swap",
  "прибыль",
  "profit",
  "символ",
  "symbol",
  "пара",
  "pair",
  "ордер",
  "order",
  "направление",
  "direction",
  "тип",
  "type",
  "состояние",
  "state",
  "цена",
  "price",
  "комментарий",
  "comment",
  "total",
  "итого",
  "всего",
  "balance",
  "баланс",
  "deposit",
  "депозит",
  "withdrawal",
  "снятие",
]);

export function convertCsvValue(raw: string, type: PropertyType, allowedValues?: string[]): ConvertResult {
  const trimmed = raw.trim();
  if (trimmed === "") return { value: null, valid: true };

  const lowerTrimmed = trimmed.toLowerCase();
  if (TRADING_HEADER_WORDS.has(lowerTrimmed)) {
    return { value: null, valid: false, error: { code: "CSV_VALUE_HEADER_ROW", args: { value: trimmed } } };
  }

  switch (type) {
    case PropertyType.TEXT:
      return { value: trimmed, valid: true };

    case PropertyType.NUMBER: {
      if (NON_NUMERIC_STATUSES.has(lowerTrimmed)) return { value: null, valid: true };
      if (/^\[.*\]$/.test(trimmed)) return { value: null, valid: true };
      const slashIdx = trimmed.indexOf(" / ");
      const valueStr = slashIdx !== -1 ? trimmed.slice(0, slashIdx) : trimmed;
      const normalized = valueStr
        .replace(/\s+/g, "")
        .replace(",", ".")
        .replace(/^\((.*)\)$/, "-$1");
      const parsed = Number(normalized);
      if (isNaN(parsed)) return { value: null, valid: false, error: { code: "CSV_VALUE_NOT_A_NUMBER", args: { value: trimmed } } };
      return { value: parsed, valid: true };
    }

    case PropertyType.CHECKBOX: {
      if (TRUTHY.has(lowerTrimmed)) return { value: true, valid: true };
      if (FALSY.has(lowerTrimmed)) return { value: false, valid: true };
      return { value: null, valid: false, error: { code: "CSV_VALUE_NOT_A_CHECKBOX", args: { value: trimmed } } };
    }

    case PropertyType.DATE: {
      const dateStr = trimmed.replace(/\./g, "-");
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return { value: null, valid: false, error: { code: "CSV_VALUE_NOT_A_DATE", args: { value: trimmed } } };
      return { value: date.toISOString(), valid: true };
    }

    case PropertyType.DURATION: {
      const parsed = Number(trimmed.replace(/\s+/g, ""));
      if (isNaN(parsed) || parsed < 0)
        return { value: null, valid: false, error: { code: "CSV_VALUE_NOT_A_DURATION", args: { value: trimmed } } };
      return { value: Math.floor(parsed), valid: true };
    }

    case PropertyType.RATING: {
      const parsed = parseInt(trimmed, 10);
      if (isNaN(parsed) || parsed < 0 || parsed > 5)
        return { value: null, valid: false, error: { code: "CSV_VALUE_RATING_RANGE", args: { value: trimmed } } };
      return { value: parsed, valid: true };
    }

    case PropertyType.PROGRESS: {
      const parsed = parseInt(trimmed, 10);
      if (isNaN(parsed) || parsed < 0 || parsed > 100)
        return { value: null, valid: false, error: { code: "CSV_VALUE_PROGRESS_RANGE", args: { value: trimmed } } };
      return { value: parsed, valid: true };
    }

    case PropertyType.SELECT:
    case PropertyType.STATUS: {
      const stripped = stripBrokerSuffix(trimmed);
      const value = allowedValues?.length ? normalizeSelectValue(stripped, allowedValues) : stripped;
      return { value, valid: true };
    }

    default:
      return { value: null, valid: false, error: { code: "CSV_TYPE_NOT_SUPPORTED", args: { type } } };
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
