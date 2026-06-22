"use client";

import { TrendingDown, TrendingUp } from "lucide-react";

interface MetricCardProps {
  label: string;
  value: string;
  compareValue?: string;
  delta?: number;
  highlight?: "positive" | "negative" | "neutral";
}

export function MetricCard({ label, value, compareValue, delta, highlight = "neutral" }: MetricCardProps) {
  const valueColor = highlight === "positive" ? "text-success" : highlight === "negative" ? "text-error" : "text-ink";

  const deltaPositive = delta !== undefined && delta > 0;
  const deltaNegative = delta !== undefined && delta < 0;

  return (
    <div className="card p-4 flex flex-col gap-2">
      <span className="type-field-label text-ink-secondary">{label}</span>
      <span className={`text-2xl font-bold tabular-nums ${valueColor}`}>{value}</span>
      {compareValue !== undefined && (
        <div className="flex items-center gap-1">
          <span className="text-xs text-ink-muted">{compareValue}</span>
          {delta !== undefined && delta !== 0 && (
            <span
              className={`flex items-center gap-0.5 text-xs font-medium ${deltaPositive ? "text-success" : deltaNegative ? "text-error" : "text-ink-muted"}`}
            >
              {deltaPositive ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
              {Math.abs(delta).toFixed(1)}%
            </span>
          )}
        </div>
      )}
    </div>
  );
}
