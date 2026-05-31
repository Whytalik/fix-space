"use client";

import { PropertyType } from "@fixspace/domain/enums";
import type { RecordResponseDto } from "@fixspace/domain";
import { Badge } from "@/components/ui/primitives/display/badge";

interface CellValueProps {
  value: unknown;
  type: PropertyType;
  relatedRecords?: RecordResponseDto[];
}

export function CellValue({ value, type, relatedRecords }: CellValueProps) {
  if (value === null || value === undefined || value === "") {
    return <span className="text-ink-muted">—</span>;
  }

  switch (type) {
    case PropertyType.CHECKBOX:
      return (
        <span
          className={`inline-block w-4 h-4 rounded border ${value ? "bg-accent border-accent" : "border-stroke"}`}
        />
      );

    case PropertyType.DATE: {
      const date = new Date(value as string);
      if (isNaN(date.getTime())) return <span className="text-ink-muted">—</span>;
      return (
        <span className="text-ink-secondary text-sm">
          {date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
        </span>
      );
    }

    case PropertyType.SELECT:
    case PropertyType.STATUS: {
      const label =
        typeof value === "object" && value !== null
          ? ((value as Record<string, unknown>).label ?? String(value))
          : String(value);
      const color =
        typeof value === "object" && value !== null
          ? ((value as Record<string, unknown>).color as string | undefined)
          : undefined;
      return (
        <Badge color={color} variant={color ? undefined : "neutral"}>
          {String(label)}
        </Badge>
      );
    }

    case PropertyType.NUMBER:
      return (
        <span className="text-ink font-mono tabular-nums text-sm">
          {typeof value === "number" ? value.toLocaleString() : String(value)}
        </span>
      );

    case PropertyType.RELATION: {
      const ids = Array.isArray(value) ? (value as string[]) : [value as string];
      const names = ids.map((id) => relatedRecords?.find((r) => r.id === id)?.name ?? null).filter(Boolean) as string[];
      if (names.length === 0) return <span className="text-ink-muted">—</span>;
      return <span className="text-ink text-sm">{names.join(", ")}</span>;
    }

    default:
      return <span className="text-ink text-sm truncate max-w-50">{String(value)}</span>;
  }
}
