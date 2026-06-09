"use client";

import { useState, useEffect } from "react";
import type { DurationPropertyConfig } from "@fixspace/domain";
import type { DurationFormat } from "@fixspace/domain/enums";

function formatDuration(totalSeconds: number, format: string): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  switch (format) {
    case "HH:mm":
      return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
    case "HH:mm:ss":
      return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
    case "Xh Ym": {
      const parts: string[] = [];
      if (hours > 0) parts.push(`${hours}h`);
      if (minutes > 0) parts.push(`${minutes}m`);
      return parts.length ? parts.join(" ") : "0m";
    }
    case "minutes":
      return `${Math.floor(totalSeconds / 60)}m`;
    case "seconds":
      return `${totalSeconds}s`;
    default:
      return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
  }
}

function parseDuration(input: string, format: DurationFormat): number | null | undefined {
  const trimmed = input.trim();
  if (trimmed === "") return null;
  if (!/^[\d:]+$/.test(trimmed)) return undefined;

  if (trimmed.includes(":")) {
    const parts = trimmed.split(":");
    if (parts.length === 2) {
      const [p0, p1] = parts as [string, string];
      if (p0 === "" || p1 === "") return undefined;
      const h = parseInt(p0, 10);
      const m = parseInt(p1, 10);
      if (isNaN(h) || isNaN(m)) return undefined;
      return h * 3600 + m * 60;
    }
    if (parts.length === 3) {
      const [p0, p1, p2] = parts as [string, string, string];
      if (p0 === "" || p1 === "" || p2 === "") return undefined;
      const h = parseInt(p0, 10);
      const m = parseInt(p1, 10);
      const s = parseInt(p2, 10);
      if (isNaN(h) || isNaN(m) || isNaN(s)) return undefined;
      return h * 3600 + m * 60 + s;
    }
    return undefined;
  }

  const n = parseInt(trimmed, 10);
  if (isNaN(n)) return undefined;
  return format === "seconds" ? n : n * 60;
}

type DurationPropertyProps = {
  value: number | null;
  readOnly?: boolean;
  config?: DurationPropertyConfig | null;
  onChange?: (value: number | "") => void;
  ghost?: boolean;
};

export function DurationProperty({ value, readOnly, config, onChange, ghost }: DurationPropertyProps) {
  const format = config?.format ?? "HH:mm";

  const displayText = value !== null && value !== undefined && !isNaN(value) ? formatDuration(value, format) : "";

  const [text, setText] = useState(displayText);

  useEffect(() => {
    setText(displayText);
  }, [displayText]);

  if (readOnly) {
    if (value === null || value === undefined || isNaN(value)) return <span className="text-ink-muted">—</span>;
    return <span className="text-ink-secondary font-mono text-sm">{formatDuration(value, format)}</span>;
  }

  function commit() {
    const result = parseDuration(text, format as DurationFormat);
    if (result === undefined) {
      setText(displayText);
    } else {
      onChange?.(result === null ? "" : result);
      setText(result === null ? "" : formatDuration(result, format));
    }
  }

  return (
    <input
      type="text"
      className={
        ghost
          ? "bg-transparent border-0 outline-none p-0 text-sm text-ink-secondary font-mono w-full placeholder:text-ink-muted"
          : "field-input"
      }
      value={text}
      placeholder={format === "seconds" ? "0" : format === "minutes" ? "0" : "00:00"}
      onChange={(e) => setText(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          e.currentTarget.blur();
        }
      }}
    />
  );
}
