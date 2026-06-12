"use client";

import { Area, AreaChart, ResponsiveContainer } from "recharts";
import type { ChartPointDto } from "@fixspace/domain";

interface ActivitySparklineProps {
  data: ChartPointDto[];
}

export function ActivitySparkline({ data }: ActivitySparklineProps) {
  if (data.length === 0) return <div className="h-12 flex items-center justify-center text-xs text-ink-muted">—</div>;

  return (
    <ResponsiveContainer width="100%" height={48}>
      <AreaChart data={data} margin={{ top: 2, right: 0, left: 0, bottom: 2 }}>
        <defs>
          <linearGradient id="sparkGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="var(--color-chart-primary)" stopOpacity={0.3} />
            <stop offset="95%" stopColor="var(--color-chart-primary)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <Area
          type="monotone"
          dataKey="value"
          stroke="var(--color-chart-primary)"
          strokeWidth={1.5}
          fill="url(#sparkGradient)"
          dot={false}
          isAnimationActive={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
