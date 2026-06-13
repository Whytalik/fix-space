"use client";

import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { NumberSeriesDto } from "@fixspace/domain";

interface NumberSeriesChartProps {
  series: NumberSeriesDto;
}

export function NumberSeriesChart({ series }: NumberSeriesChartProps) {
  if (series.points.length === 0) return null;

  return (
    <div className="card p-4">
      <h3 className="type-form-label text-ink-secondary mb-3">{series.propertyName}</h3>
      <ResponsiveContainer width="100%" height={140}>
        <LineChart data={series.points} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-stroke)" vertical={false} />
          <XAxis
            dataKey="date"
            tick={{ fill: "var(--color-ink-secondary)", fontSize: 10 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v: string) => v.slice(5)}
          />
          <YAxis tick={{ fill: "var(--color-ink-secondary)", fontSize: 10 }} axisLine={false} tickLine={false} width={48} />
          <Tooltip
            contentStyle={{ backgroundColor: "var(--color-elevated)", border: "1px solid var(--color-stroke)", borderRadius: 8 }}
            labelStyle={{ color: "var(--color-ink-secondary)", fontSize: 11 }}
            itemStyle={{ color: "var(--color-ink)", fontSize: 12 }}
          />
          <Line type="monotone" dataKey="value" stroke="var(--color-accent)" strokeWidth={2} dot={false} name={series.propertyName} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
