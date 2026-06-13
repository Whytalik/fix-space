"use client";

import { useTranslations } from "next-intl";
import type { TradingMetricsDto } from "@fixspace/domain";
import { MetricCard } from "./metric-card";

interface MetricsGridProps {
  metrics: TradingMetricsDto;
  compareMetrics?: TradingMetricsDto;
}

function pct(a: number, b: number): number {
  if (b === 0) return 0;
  return ((a - b) / Math.abs(b)) * 100;
}

function formatPnl(value: number): string {
  const sign = value >= 0 ? "+" : "";
  return `${sign}${value.toLocaleString("en", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function MetricsGrid({ metrics, compareMetrics }: MetricsGridProps) {
  const t = useTranslations("Statistics.metrics");

  const cards = [
    {
      label: t("totalTrades"),
      value: metrics.totalTrades.toString(),
      compareValue: compareMetrics ? compareMetrics.totalTrades.toString() : undefined,
      delta: compareMetrics ? pct(metrics.totalTrades, compareMetrics.totalTrades) : undefined,
    },
    {
      label: t("winRate"),
      value: `${(metrics.winRate * 100).toFixed(1)}%`,
      compareValue: compareMetrics ? `${(compareMetrics.winRate * 100).toFixed(1)}%` : undefined,
      delta: compareMetrics ? pct(metrics.winRate, compareMetrics.winRate) : undefined,
      highlight: (metrics.winRate >= 0.5 ? "positive" : "negative") as "positive" | "negative",
    },
    {
      label: t("profitFactor"),
      value: metrics.profitFactor.toFixed(2),
      compareValue: compareMetrics ? compareMetrics.profitFactor.toFixed(2) : undefined,
      delta: compareMetrics ? pct(metrics.profitFactor, compareMetrics.profitFactor) : undefined,
      highlight: (metrics.profitFactor >= 1.5 ? "positive" : metrics.profitFactor < 1 ? "negative" : "neutral") as
        | "positive"
        | "negative"
        | "neutral",
    },
    {
      label: t("totalPnl"),
      value: formatPnl(metrics.totalPnl),
      compareValue: compareMetrics ? formatPnl(compareMetrics.totalPnl) : undefined,
      delta: compareMetrics ? pct(metrics.totalPnl, compareMetrics.totalPnl) : undefined,
      highlight: (metrics.totalPnl >= 0 ? "positive" : "negative") as "positive" | "negative",
    },
    {
      label: t("expectancy"),
      value: formatPnl(metrics.expectancy),
      compareValue: compareMetrics ? formatPnl(compareMetrics.expectancy) : undefined,
      delta: compareMetrics ? pct(metrics.expectancy, compareMetrics.expectancy) : undefined,
      highlight: (metrics.expectancy >= 0 ? "positive" : "negative") as "positive" | "negative",
    },
    {
      label: t("maxDrawdown"),
      value: formatPnl(-metrics.maxDrawdown),
      compareValue: compareMetrics ? formatPnl(-compareMetrics.maxDrawdown) : undefined,
      delta: compareMetrics ? -pct(metrics.maxDrawdown, compareMetrics.maxDrawdown) : undefined,
      highlight: (metrics.maxDrawdown === 0 ? "positive" : "negative") as "positive" | "negative",
    },
    {
      label: t("avgWin"),
      value: formatPnl(metrics.avgWin),
      compareValue: compareMetrics ? formatPnl(compareMetrics.avgWin) : undefined,
      delta: compareMetrics ? pct(metrics.avgWin, compareMetrics.avgWin) : undefined,
      highlight: "positive" as const,
    },
    {
      label: t("avgLoss"),
      value: formatPnl(-metrics.avgLoss),
      compareValue: compareMetrics ? formatPnl(-compareMetrics.avgLoss) : undefined,
      delta: compareMetrics ? -pct(metrics.avgLoss, compareMetrics.avgLoss) : undefined,
      highlight: "negative" as const,
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
      {cards.map((card) => (
        <MetricCard key={card.label} {...card} />
      ))}
    </div>
  );
}
