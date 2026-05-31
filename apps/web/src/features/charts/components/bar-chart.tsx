"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { BaseChart, CustomTooltip } from "./base-chart";

interface ChartDataPoint {
  name: string;
  [key: string]: string | number;
}

interface BarChartWrapperProps {
  data: ChartDataPoint[];
  dataKey: string;
  name: string;
  color: string;
}

export function BarChartWrapper({ data, dataKey, name, color }: BarChartWrapperProps) {
  return (
    <BaseChart>
      <BarChart
        data={data}
        margin={{
          top: 5,
          right: 10,
          left: -20,
          bottom: 0,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-stroke-subtle)" />
        <XAxis dataKey="name" stroke="var(--color-ink-muted)" fontSize={12} tickLine={false} axisLine={false} />
        <YAxis stroke="var(--color-ink-muted)" fontSize={12} tickLine={false} axisLine={false} unit="%" />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: "var(--color-hover)" }} />
        <Bar dataKey={dataKey} name={name} fill={color} radius={[4, 4, 0, 0]} />
      </BarChart>
    </BaseChart>
  );
}
