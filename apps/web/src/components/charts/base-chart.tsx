"use client";

import { ResponsiveContainer } from "recharts";

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    color: string;
    name: string;
    value: string | number;
  }>;
  label?: string;
}

export const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border border-stroke bg-elevated px-4 py-2 text-sm shadow-lg z-50 relative">
        <p className="font-medium text-ink">{label}</p>
        {payload.map((p, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full" style={{ backgroundColor: p.color }} />
            <p className="text-ink-secondary">
              {`${p.name}: `}
              <span className="font-semibold text-ink">{p.value}</span>
            </p>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

interface BaseChartProps {
  children: React.ReactNode;
}

export function BaseChart({ children }: BaseChartProps) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      {children}
    </ResponsiveContainer>
  );
}
