"use client";

import type { FormulaPropertyConfig } from "@fixspace/domain";
import { PropertyType } from "@fixspace/domain/enums";
import { useDateFormat } from "@/hooks/format/use-date-format";

type FormulaPropertyProps = {
  readOnly?: boolean;
  value?: unknown;
  config?: FormulaPropertyConfig | null;
};

export function FormulaProperty({ readOnly, value, config }: FormulaPropertyProps) {
  const { formatDate } = useDateFormat();

  if (readOnly) {
    const resultType = config?.resultType ?? PropertyType.TEXT;

    if (resultType === PropertyType.CHECKBOX) {
      return <span className={`inline-block w-4 h-4 rounded border ${value ? "bg-accent border-accent" : "border-stroke"}`} />;
    }

    if (resultType === PropertyType.DATE) {
      const date = new Date(value as string);
      if (isNaN(date.getTime())) return <span className="text-ink-muted">—</span>;
      return <span className="type-body text-ink-secondary">{formatDate(date)}</span>;
    }

    if (resultType === PropertyType.NUMBER || resultType === PropertyType.RATING || resultType === PropertyType.PROGRESS) {
      return (
        <span className="text-ink font-mono tabular-nums text-sm">
          {typeof value === "number" ? value.toLocaleString() : String(value ?? "")}
        </span>
      );
    }

    return (
      <span className="type-body text-ink truncate max-w-50">
        {Array.isArray(value) ? (value as unknown[]).join(", ") : String(value ?? "")}
      </span>
    );
  }

  return <input type="text" className="field-input" value="" disabled />;
}
