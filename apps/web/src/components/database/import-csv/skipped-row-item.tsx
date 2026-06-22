"use client";

import { useState } from "react";

interface SkippedRowItemProps {
  rowIndex: number;
  reason: string;
  rowLabel: string;
}

export function SkippedRowItem({ rowIndex, reason, rowLabel }: SkippedRowItemProps) {
  const [expanded, setExpanded] = useState(false);
  const lines = reason.split("\n");
  const isLong = lines.length > 2 || reason.length > 120;

  return (
    <div className="flex gap-3 px-4 py-2">
      <span className="type-hint text-ink-muted shrink-0">
        {rowLabel} {rowIndex}
      </span>
      <div className="flex-1 min-w-0">
        <div className={`type-hint text-error flex flex-col gap-0.5${!expanded && isLong ? " line-clamp-2" : ""}`}>
          {lines.map((line, index) => (
            <span key={index}>{line}</span>
          ))}
        </div>
      </div>
      {isLong && (
        <button
          type="button"
          onClick={() => setExpanded((prev) => !prev)}
          className="shrink-0 type-hint text-ink-muted hover:text-ink transition-colors duration-150 underline"
        >
          {expanded ? "↑" : "↓"}
        </button>
      )}
    </div>
  );
}
