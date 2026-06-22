"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import type { ChartComponentData } from "@fixspace/domain";
import { useDatabaseContext } from "@/context/database-context";
import { Spinner } from "@/components/ui/primitives/feedback/spinner";
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
} from "recharts";
import { CHART_COLORS } from "./chart-constants";
import { ChartPlaceholder } from "./chart-placeholder";
import { ChartWrapper } from "./chart-wrapper";

interface RelationChartInnerProps {
  data: ChartComponentData;
  relationIds: string[];
}

export function RelationChartInner({ data, relationIds }: RelationChartInnerProps) {
  const t = useTranslations("RecordPage.inspector");
  const databaseContext = useDatabaseContext();
  const source = data.source.type === "relation" ? data.source : null;

  const chartData = useMemo(() => {
    if (!source || databaseContext.isLoading) return [];

    const filteredRecords = databaseContext.records.filter((recordItem) => relationIds.includes(recordItem.id));

    const getValue = (recordItem: (typeof databaseContext.records)[0], field: string): number => {
      const propertyValue = recordItem.values?.find((valueItem) => valueItem.propertyName === field);
      return typeof propertyValue?.value === "number" ? propertyValue.value : 0;
    };

    const getString = (recordItem: (typeof databaseContext.records)[0], field: string): string => {
      const propertyValue = recordItem.values?.find((valueItem) => valueItem.propertyName === field);
      return String(propertyValue?.value ?? "");
    };

    if (source.aggregate === "cumulative-sum") {
      let cumulative = 0;
      return filteredRecords
        .slice()
        .sort((recordA, recordB) => {
          const valueA = getString(recordA, source.xField);
          const valueB = getString(recordB, source.xField);
          return valueA < valueB ? -1 : valueA > valueB ? 1 : 0;
        })
        .map((recordItem) => {
          cumulative += getValue(recordItem, source.yField);
          return { x: getString(recordItem, source.xField), y: parseFloat(cumulative.toFixed(2)) };
        });
    }

    if (source.groupBy) {
      const groups = new Map<string, number[]>();
      filteredRecords.forEach((recordItem) => {
        const groupKey = getString(recordItem, source.groupBy!);
        const numericValue = getValue(recordItem, source.yField);
        if (!groups.has(groupKey)) groups.set(groupKey, []);
        groups.get(groupKey)!.push(numericValue);
      });
      return Array.from(groups.entries()).map(([groupKey, valueList]) => {
        const aggregation = source.aggregate ?? "avg";
        let resultValue = 0;
        if (aggregation === "sum") {
          resultValue = valueList.reduce((accumulator, currentValue) => accumulator + currentValue, 0);
        } else if (aggregation === "count") {
          resultValue = valueList.length;
        } else {
          resultValue = valueList.reduce((accumulator, currentValue) => accumulator + currentValue, 0) / valueList.length;
        }
        return { x: groupKey, y: parseFloat(resultValue.toFixed(2)) };
      });
    }

    return filteredRecords.map((recordItem) => ({
      x: getString(recordItem, source.xField),
      y: getValue(recordItem, source.yField),
    }));
  }, [databaseContext, source, relationIds]);

  if (databaseContext.isLoading) {
    return (
      <div className="py-6 flex justify-center">
        <Spinner size="sm" />
      </div>
    );
  }
  if (!chartData.length) return <ChartPlaceholder title={data.title} message={t("noData")} />;

  const renderChart = () => {
    switch (data.chartType) {
      case "pie":
        return (
          <PieChart>
            <Pie data={chartData} dataKey="y" nameKey="x" cx="50%" cy="50%" outerRadius={80} label={({ name }) => name}>
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
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-stroke)" />
            <XAxis dataKey="x" tick={{ fontSize: 11, fill: "var(--color-ink-secondary)" }} />
            <YAxis tick={{ fontSize: 11, fill: "var(--color-ink-secondary)" }} />
            <Tooltip
              contentStyle={{ background: "var(--color-elevated)", border: "1px solid var(--color-stroke)", borderRadius: 8, fontSize: 12 }}
            />
            <Bar dataKey="y" fill={CHART_COLORS[0]} radius={[4, 4, 0, 0]}>
              {chartData.map((_, index) => (
                <Cell key={index} fill={CHART_COLORS[index % CHART_COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        );
      case "area":
        return (
          <AreaChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-stroke)" />
            <XAxis dataKey="x" tick={{ fontSize: 11, fill: "var(--color-ink-secondary)" }} />
            <YAxis tick={{ fontSize: 11, fill: "var(--color-ink-secondary)" }} />
            <Tooltip
              contentStyle={{ background: "var(--color-elevated)", border: "1px solid var(--color-stroke)", borderRadius: 8, fontSize: 12 }}
            />
            <Area type="monotone" dataKey="y" fill={CHART_COLORS[0]} fillOpacity={0.3} stroke={CHART_COLORS[0]} strokeWidth={2} />
          </AreaChart>
        );
      case "radar":
        return (
          <RadarChart data={chartData} cx="50%" cy="50%" outerRadius="80%">
            <PolarGrid stroke="var(--color-stroke)" />
            <PolarAngleAxis dataKey="x" tick={{ fontSize: 11, fill: "var(--color-ink-secondary)" }} />
            <Radar name="Value" dataKey="y" stroke={CHART_COLORS[0]} fill={CHART_COLORS[0]} fillOpacity={0.4} />
            <Tooltip
              contentStyle={{ background: "var(--color-elevated)", border: "1px solid var(--color-stroke)", borderRadius: 8, fontSize: 12 }}
            />
          </RadarChart>
        );
      case "scatter":
        return (
          <ScatterChart>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-stroke)" />
            <XAxis dataKey="x" type="category" tick={{ fontSize: 11, fill: "var(--color-ink-secondary)" }} />
            <YAxis dataKey="y" type="number" tick={{ fontSize: 11, fill: "var(--color-ink-secondary)" }} />
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
            <XAxis
              dataKey="x"
              tick={{ fontSize: 11, fill: "var(--color-ink-secondary)" }}
              tickFormatter={(value: string) => value.slice(0, 8)}
            />
            <YAxis tick={{ fontSize: 11, fill: "var(--color-ink-secondary)" }} />
            <Tooltip
              contentStyle={{ background: "var(--color-elevated)", border: "1px solid var(--color-stroke)", borderRadius: 8, fontSize: 12 }}
            />
            <Line type="monotone" dataKey="y" stroke={CHART_COLORS[0]} strokeWidth={2} dot={false} />
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
