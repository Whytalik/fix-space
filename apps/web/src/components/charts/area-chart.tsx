"use client";

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { BaseChart, CustomTooltip } from "./base-chart";

interface ChartDataPoint {
  name: string;
  [key: string]: string | number;
}

interface AreaChartWrapperProps {
  data: ChartDataPoint[];
  dataKey: string;
  name: string;
  color: string;
  gradientId: string;
}

export function AreaChartWrapper({ data, dataKey, name, color, gradientId }: AreaChartWrapperProps) {
  return (
    <BaseChart>
      <AreaChart
        data={data}
        margin={{
          top: 5,
          right: 10,
          left: -20,
          bottom: 0,
        }}
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={color} stopOpacity={0.4} />
            <stop offset="95%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-stroke-subtle)" />
        <XAxis dataKey="name" stroke="var(--color-ink-muted)" fontSize={12} tickLine={false} axisLine={false} />
        <YAxis stroke="var(--color-ink-muted)" fontSize={12} tickLine={false} axisLine={false} />
        <Tooltip
          content={<CustomTooltip />}
          cursor={{ stroke: "var(--color-accent)", strokeWidth: 1, strokeDasharray: "3 3" }}
        />
        <Area
          type="monotone"
          dataKey={dataKey}
          name={name}
          stroke={color}
          strokeWidth={2}
          fillOpacity={1}
          fill={`url(#${gradientId})`}
        />
      </AreaChart>
    </BaseChart>
  );
}
