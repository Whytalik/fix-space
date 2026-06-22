"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import type { ChartComponentData } from "@fixspace/domain";
import { useRecordQuery } from "@/hooks/api/use-record-query";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  AreaChart,
  Area,
  ScatterChart,
  Scatter,
  ZAxis,
} from "recharts";
import { CHART_COLORS } from "./chart-constants";
import { ChartPlaceholder } from "./chart-placeholder";
import { ChartWrapper } from "./chart-wrapper";

interface RecordPropertiesChartProps {
  data: ChartComponentData;
  recordId?: string;
}

export function RecordPropertiesChart({ data, recordId }: RecordPropertiesChartProps) {
  const t = useTranslations("RecordPage.inspector");
  const { data: record } = useRecordQuery(recordId ?? "", { enabled: Boolean(recordId) });
  const source = data.source.type === "record-properties" ? data.source : null;

  const chartData = useMemo(() => {
    if (!record?.values || !source) return [];
    return source.fields.map((field) => {
      const propertyValue = record.values?.find((valueItem) => valueItem.propertyName === field);
      const numericValue = typeof propertyValue?.value === "number" ? propertyValue.value : 0;
      return { field, value: numericValue };
    });
  }, [record, source]);

  if (!recordId) return <ChartPlaceholder title={data.title} message={t("openRecordForChart")} />;
  if (!chartData.length) return <ChartPlaceholder title={data.title} message={t("noData")} />;

  const renderChart = () => {
    switch (data.chartType) {
      case "radar":
        return (
          <RadarChart data={chartData}>
            <PolarGrid stroke="var(--color-stroke)" />
            <PolarAngleAxis dataKey="field" tick={{ fontSize: 12, fill: "var(--color-ink-secondary)" }} />
            <Radar dataKey="value" fill={CHART_COLORS[0]} fillOpacity={0.35} stroke={CHART_COLORS[0]} strokeWidth={2} />
            <Tooltip
              contentStyle={{ background: "var(--color-elevated)", border: "1px solid var(--color-stroke)", borderRadius: 8, fontSize: 12 }}
            />
          </RadarChart>
        );
      case "pie":
        return (
          <PieChart>
            <Pie data={chartData} dataKey="value" nameKey="field" cx="50%" cy="50%" outerRadius={80} label={({ name }) => name}>
              {chartData.map((_, index) => (
                <Cell key={index} fill={CHART_COLORS[index % CHART_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{ background: "var(--color-elevated)", border: "1px solid var(--color-stroke)", borderRadius: 8, fontSize: 12 }}
            />
            <Legend />
          </PieChart>
        );
      case "bar":
        return (
          <BarChart data={chartData} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-stroke)" />
            <XAxis type="number" tick={{ fontSize: 11, fill: "var(--color-ink-secondary)" }} />
            <YAxis dataKey="field" type="category" width={100} tick={{ fontSize: 11, fill: "var(--color-ink-secondary)" }} />
            <Tooltip
              contentStyle={{ background: "var(--color-elevated)", border: "1px solid var(--color-stroke)", borderRadius: 8, fontSize: 12 }}
            />
            <Bar dataKey="value" fill={CHART_COLORS[0]} radius={[0, 4, 4, 0]} />
          </BarChart>
        );
      case "area":
        return (
          <AreaChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-stroke)" />
            <XAxis dataKey="field" tick={{ fontSize: 11, fill: "var(--color-ink-secondary)" }} />
            <YAxis tick={{ fontSize: 11, fill: "var(--color-ink-secondary)" }} />
            <Tooltip
              contentStyle={{ background: "var(--color-elevated)", border: "1px solid var(--color-stroke)", borderRadius: 8, fontSize: 12 }}
            />
            <Area type="monotone" dataKey="value" fill={CHART_COLORS[0]} fillOpacity={0.3} stroke={CHART_COLORS[0]} strokeWidth={2} />
          </AreaChart>
        );
      case "scatter":
        return (
          <ScatterChart>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-stroke)" />
            <XAxis dataKey="field" type="category" tick={{ fontSize: 11, fill: "var(--color-ink-secondary)" }} />
            <YAxis dataKey="value" type="number" tick={{ fontSize: 11, fill: "var(--color-ink-secondary)" }} />
            <ZAxis range={[60, 400]} />
            <Tooltip
              cursor={{ strokeDasharray: "3 3" }}
              contentStyle={{ background: "var(--color-elevated)", border: "1px solid var(--color-stroke)", borderRadius: 8, fontSize: 12 }}
            />
            <Scatter name="Data" data={chartData} fill={CHART_COLORS[0]} />
          </ScatterChart>
        );
      default:
        return (
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-stroke)" />
            <XAxis dataKey="field" tick={{ fontSize: 11, fill: "var(--color-ink-secondary)" }} />
            <YAxis tick={{ fontSize: 11, fill: "var(--color-ink-secondary)" }} />
            <Tooltip
              contentStyle={{ background: "var(--color-elevated)", border: "1px solid var(--color-stroke)", borderRadius: 8, fontSize: 12 }}
            />
            <Line type="monotone" dataKey="value" stroke={CHART_COLORS[0]} strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
          </LineChart>
        );
    }
  };

  return (
    <ChartWrapper title={data.title}>
      <ResponsiveContainer width="100%" height={240}>
        {renderChart()}
      </ResponsiveContainer>
    </ChartWrapper>
  );
}
