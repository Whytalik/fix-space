"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import type { BreakdownGroupDto } from "@fixspace/domain";

interface SelectBreakdownChartProps {
  group: BreakdownGroupDto;
}

const COLORS = ["#2563eb", "#57f287", "#fee75c", "#ed4245", "#9494a8", "#00d2ff"];

export function SelectBreakdownChart({ group }: SelectBreakdownChartProps) {
  const data = group.items.map((item) => ({ name: item.label, value: item.count }));

  return (
    <div className="card p-4">
      <h3 className="type-form-label text-ink-secondary mb-2">{group.propertyName}</h3>
      <div className="flex gap-4 items-start">
        <ResponsiveContainer width={120} height={120}>
          <PieChart>
            <Pie data={data} dataKey="value" cx="50%" cy="50%" innerRadius={30} outerRadius={55} paddingAngle={2}>
              {data.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{ backgroundColor: "#222228", border: "1px solid #2a2a35", borderRadius: 8 }}
              itemStyle={{ color: "#e8e8f0", fontSize: 11 }}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="flex flex-col gap-1 flex-1 min-w-0">
          {data.map((item, i) => (
            <div key={item.name} className="flex items-center gap-1.5 text-xs">
              <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
              <span className="text-ink-secondary truncate">{item.name}</span>
              <span className="text-ink-muted ml-auto">{item.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
