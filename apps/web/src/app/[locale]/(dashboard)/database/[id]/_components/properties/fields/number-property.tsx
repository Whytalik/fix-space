"use client";

import type { NumberPropertyConfig } from "@fixspace/domain";

interface NumberPropertyProps {
  value: unknown;
  config?: NumberPropertyConfig | null;
  readOnly?: boolean;
  onChange?: (value: number | "") => void;
  placeholder?: string;
  ghost?: boolean;
  className?: string;
}

export function NumberProperty({ value, config, readOnly, onChange, placeholder = "0", ghost, className }: NumberPropertyProps) {
  function formatNumber(input: unknown) {
    if (input === null || input === undefined || input === "") return "";
    const parsed = Number(input);
    if (isNaN(parsed)) return String(input);

    const isInteger = config?.format === "integer";
    const decimalPlaces = isInteger ? 0 : (config?.decimalPlaces ?? 2);

    let formatted = parsed.toLocaleString(undefined, {
      minimumFractionDigits: decimalPlaces,
      maximumFractionDigits: decimalPlaces,
    });

    if (config?.format === "currency") {
      formatted = `${config.currencySymbol || "$"}${formatted}`;
    } else if (config?.format === "percentage") {
      formatted = `${formatted}%`;
    }

    return `${config?.prefix ?? ""}${formatted}${config?.suffix ?? ""}`;
  }

  if (readOnly) {
    const formatted = formatNumber(value);
    if (!formatted && formatted !== "0") return <span className="text-ink-muted">—</span>;
    return <span className={`text-ink font-mono tabular-nums text-sm ${className || "truncate max-w-full"}`}>{formatted}</span>;
  }

  const numericValue = value === "" || value === undefined || value === null ? "" : Number(value);

  return (
    <div className="flex items-center gap-1 w-full">
      {config?.prefix && <span className="text-ink-muted text-xs shrink-0">{config.prefix}</span>}
      {config?.format === "currency" && config.currencySymbol && (
        <span className="text-ink-muted text-xs shrink-0">{config.currencySymbol}</span>
      )}
      <input
        type="number"
        className={
          ghost
            ? "bg-transparent border-0 outline-none p-0 text-sm text-ink font-mono tabular-nums flex-1 min-w-0 w-full placeholder:text-ink-muted appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            : "field-input flex-1 min-w-0"
        }
        value={numericValue}
        step={config?.format === "integer" ? "1" : "any"}
        onKeyDown={(e) => {
          if (config?.format === "integer" && (e.key === "." || e.key === ",")) {
            e.preventDefault();
          }
        }}
        onChange={(e) => {
          const rawInput = e.target.value;
          if (rawInput === "") {
            onChange?.("");
          } else {
            let parsed = Number(rawInput);
            if (config?.format === "integer") parsed = Math.round(parsed);
            onChange?.(parsed);
          }
        }}
        placeholder={placeholder}
      />
      {config?.format === "percentage" && <span className="text-ink-muted text-xs shrink-0">%</span>}
      {config?.suffix && <span className="text-ink-muted text-xs shrink-0">{config.suffix}</span>}
    </div>
  );
}
