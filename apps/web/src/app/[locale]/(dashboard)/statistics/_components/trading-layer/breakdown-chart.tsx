"use client";

import { Bar, BarChart, CartesianGrid, Cell, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { BreakdownGroupDto } from "@fixspace/domain";
import { useTranslations } from "next-intl";

interface BreakdownChartProps {
  group: BreakdownGroupDto;
  compareGroup?: BreakdownGroupDto;
}

const COLORS = [
  "var(--color-accent)",
  "var(--color-success)",
  "var(--color-warning)",
  "var(--color-error)",
  "var(--color-ink-secondary)",
  "var(--color-chart-cyan)",
  "var(--color-chart-orange)",
  "var(--color-chart-compare)",
];

export function BreakdownChart({ group, compareGroup }: BreakdownChartProps) {
  const t = useTranslations("Statistics");

  const allLabels = Array.from(new Set([...group.items.map((i) => i.label), ...(compareGroup?.items.map((i) => i.label) ?? [])]));

  const data = allLabels.map((label) => ({
    label,
    current: group.items.find((i) => i.label === label)?.count ?? 0,
    winRate: Math.round((group.items.find((i) => i.label === label)?.winRate ?? 0) * 100),
    avgPnl: group.items.find((i) => i.label === label)?.avgPnl ?? 0,
    compare: compareGroup?.items.find((i) => i.label === label)?.count,
  }));

  const barSize = compareGroup ? 9 : 18;

  return (
    <div className="card p-4">
      <h3 className="type-form-label text-ink-secondary mb-3">{group.propertyName}</h3>
      <ResponsiveContainer width="100%" height={compareGroup ? 200 : 160}>
        <BarChart data={data} layout="vertical" margin={{ top: 0, right: 4, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-stroke)" horizontal={false} />
          <XAxis type="number" tick={{ fill: "var(--color-ink-secondary)", fontSize: 10 }} axisLine={false} tickLine={false} />
          <YAxis
            type="category"
            dataKey="label"
            tick={{ fill: "var(--color-ink-secondary)", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            width={80}
          />
          <Tooltip
            contentStyle={{ backgroundColor: "var(--color-elevated)", border: "1px solid var(--color-stroke)", borderRadius: 8 }}
            labelStyle={{ color: "var(--color-ink)", fontSize: 11 }}
            itemStyle={{ color: "var(--color-ink-secondary)", fontSize: 11 }}
          />
          {compareGroup && <Legend wrapperStyle={{ fontSize: 11, color: "var(--color-ink-secondary)" }} />}
          <Bar dataKey="current" name={t("equityCurve")} radius={[0, 4, 4, 0]} maxBarSize={barSize}>
            {data.map((_, index) => (
              <Cell key={index} fill={COLORS[index % COLORS.length]} />
            ))}
          </Bar>
          {compareGroup && (
            <Bar
              dataKey="compare"
              name={t("compare")}
              radius={[0, 4, 4, 0]}
              maxBarSize={barSize}
              fill="var(--color-chart-compare)"
              opacity={0.65}
            />
          )}
        </BarChart>
      </ResponsiveContainer>

      {!compareGroup && (
        <div className="mt-3 flex flex-col gap-1">
          {data.map((item, i) => (
            <div key={item.label} className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                <span className="text-ink-secondary truncate max-w-[100px]">{item.label}</span>
              </div>
              <div className="flex items-center gap-3 text-ink-muted">
                <span>
                  {item.current} {t("trades")}
                </span>
                <span>
                  {item.winRate}% {t("winRateShort")}
                </span>
                <span className={item.avgPnl >= 0 ? "text-success" : "text-error"}>
                  {item.avgPnl >= 0 ? "+" : ""}
                  {item.avgPnl.toFixed(2)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
