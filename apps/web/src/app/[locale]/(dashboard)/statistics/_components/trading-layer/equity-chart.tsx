"use client";

import { useTranslations } from "next-intl";
import { Area, AreaChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { ChartPointDto } from "@fixspace/domain";

interface EquityChartProps {
  data: ChartPointDto[];
  compareData?: ChartPointDto[];
}

export function EquityChart({ data, compareData }: EquityChartProps) {
  const t = useTranslations("Statistics");

  if (data.length === 0 && (!compareData || compareData.length === 0)) {
    return <div className="card p-6 mb-4 flex items-center justify-center h-48 text-ink-muted text-sm">{t("noDataForPeriod")}</div>;
  }

  const totalLength = Math.max(data.length, compareData?.length ?? 0);
  const combined = Array.from({ length: totalLength }, (_, i) => ({
    trade: i + 1,
    current: data[i]?.value,
    compare: compareData?.[i]?.value,
  }));

  const allValues = [...data.map((p) => p.value), ...(compareData ?? []).map((p) => p.value)];
  const min = allValues.length ? Math.min(...allValues) : 0;
  const max = allValues.length ? Math.max(...allValues) : 0;
  const domainPad = Math.abs(max - min) * 0.1 || 10;

  const isPositive = (data[data.length - 1]?.value ?? 0) >= 0;
  const mainColor = isPositive ? "var(--color-success)" : "var(--color-error)";

  return (
    <div className="card p-4 mb-4">
      <h2 className="type-panel-title mb-4">{t("equityCurve")}</h2>
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={combined} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="equityGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={mainColor} stopOpacity={0.2} />
              <stop offset="95%" stopColor={mainColor} stopOpacity={0} />
            </linearGradient>
            <linearGradient id="compareGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--color-chart-compare)" stopOpacity={0.15} />
              <stop offset="95%" stopColor="var(--color-chart-compare)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-stroke)" vertical={false} />
          <XAxis
            dataKey="trade"
            tick={{ fill: "var(--color-ink-secondary)", fontSize: 10 }}
            axisLine={false}
            tickLine={false}
            label={{
              value: compareData ? "Trade #" : "",
              position: "insideBottomRight",
              offset: -4,
              fill: "var(--color-ink-secondary)",
              fontSize: 10,
            }}
          />
          <YAxis
            tick={{ fill: "var(--color-ink-secondary)", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            domain={[min - domainPad, max + domainPad]}
            tickFormatter={(v: number) => v.toFixed(0)}
            width={55}
          />
          <Tooltip
            contentStyle={{ backgroundColor: "var(--color-elevated)", border: "1px solid var(--color-stroke)", borderRadius: 8 }}
            labelFormatter={(v) => `Trade #${v}`}
            labelStyle={{ color: "var(--color-ink-secondary)", fontSize: 11 }}
            itemStyle={{ fontSize: 12 }}
          />
          {compareData && <Legend wrapperStyle={{ fontSize: 11, color: "var(--color-ink-secondary)" }} />}
          <Area
            type="monotone"
            dataKey="current"
            name={t("equityCurve")}
            stroke={mainColor}
            strokeWidth={2}
            fill="url(#equityGrad)"
            dot={false}
            connectNulls
          />
          {compareData && (
            <Area
              type="monotone"
              dataKey="compare"
              name={t("compare")}
              stroke="var(--color-chart-compare)"
              strokeWidth={1.5}
              strokeDasharray="4 2"
              fill="url(#compareGrad)"
              dot={false}
              connectNulls
            />
          )}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
