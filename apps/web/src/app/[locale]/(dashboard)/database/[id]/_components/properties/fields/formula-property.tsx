"use client";

import type { FormulaPropertyConfig } from "@fixspace/domain";
import { PropertyType } from "@fixspace/domain";
import { useDateFormat } from "@/hooks/format/use-date-format";

type FormulaPropertyProps = {
  readOnly?: boolean;
  value?: unknown;
  config?: FormulaPropertyConfig | null;
  className?: string;
};

export function FormulaProperty({ readOnly, value, config, className }: FormulaPropertyProps) {
  const { formatDate } = useDateFormat();

  if (readOnly) {
    if (typeof value === "string" && value.includes("field_")) {
      return <span className="text-ink-muted">—</span>;
    }

    const resultType = config?.resultType ?? PropertyType.TEXT;

    if (resultType === PropertyType.CHECKBOX) {
      return <span className={`inline-block w-4 h-4 rounded border ${value ? "bg-accent border-accent" : "border-stroke"}`} />;
    }

    if (resultType === PropertyType.DATE) {
      const date = new Date(value as string);
      if (isNaN(date.getTime())) return <span className="text-ink-muted">—</span>;
      return <span className="text-sm text-ink-secondary">{formatDate(date)}</span>;
    }

    if (resultType === PropertyType.NUMBER || resultType === PropertyType.RATING || resultType === PropertyType.PROGRESS) {
      return (
        <span className="text-ink font-mono tabular-nums text-sm">
          {typeof value === "number" ? value.toLocaleString() : String(value ?? "")}
        </span>
      );
    }

    return (
      <span className={`text-sm text-ink ${className || "truncate max-w-full"}`}>
        {Array.isArray(value) ? (value as unknown[]).join(", ") : String(value ?? "")}
      </span>
    );
  }

  return <input type="text" className="field-input" value="" disabled />;
}
