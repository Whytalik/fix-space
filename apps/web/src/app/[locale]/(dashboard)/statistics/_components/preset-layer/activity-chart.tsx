"use client";

import { Area, AreaChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useTranslations } from "next-intl";
import type { ChartPointDto } from "@fixspace/domain";

interface ActivityChartProps {
  data: ChartPointDto[];
  compareData?: ChartPointDto[];
}

export function ActivityChart({ data, compareData }: ActivityChartProps) {
  const t = useTranslations("Statistics");

  const isEmpty = data.length === 0 && (!compareData || compareData.length === 0);
  if (isEmpty) {
    return <div className="flex items-center justify-center h-40 text-sm text-ink-muted">{t("noDataForPeriod")}</div>;
  }

  const totalLength = Math.max(data.length, compareData?.length ?? 0);
  const combined = Array.from({ length: totalLength }, (_, i) => ({
    index: i + 1,
    current: data[i]?.value,
    compare: compareData?.[i]?.value,
  }));

  return (
    <div>
      <p className="type-form-label text-ink-secondary mb-3">{t("activityCurve")}</p>
      <ResponsiveContainer width="100%" height={180}>
        <AreaChart data={combined} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="actGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--color-chart-primary)" stopOpacity={0.25} />
              <stop offset="95%" stopColor="var(--color-chart-primary)" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="actCompareGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--color-chart-compare)" stopOpacity={0.15} />
              <stop offset="95%" stopColor="var(--color-chart-compare)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-stroke)" vertical={false} />
          <XAxis dataKey="index" tick={{ fill: "var(--color-ink-secondary)", fontSize: 10 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: "var(--color-ink-secondary)", fontSize: 10 }} axisLine={false} tickLine={false} allowDecimals={false} />
          <Tooltip
            contentStyle={{ backgroundColor: "var(--color-elevated)", border: "1px solid var(--color-stroke)", borderRadius: 8 }}
            labelStyle={{ color: "var(--color-ink)", fontSize: 11 }}
            itemStyle={{ color: "var(--color-ink-secondary)", fontSize: 11 }}
          />
          {compareData && <Legend wrapperStyle={{ fontSize: 11, color: "var(--color-ink-secondary)" }} />}
          <Area
            type="monotone"
            dataKey="current"
            name={t("activityCurve")}
            stroke="var(--color-chart-primary)"
            strokeWidth={2}
            fill="url(#actGradient)"
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
              fill="url(#actCompareGradient)"
              dot={false}
              connectNulls
            />
          )}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
