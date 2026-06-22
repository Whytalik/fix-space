"use client";

import { useTranslations } from "next-intl";
import type { ChartComponentData } from "@fixspace/domain";
import { ChartPlaceholder } from "./chart/chart-placeholder";
import { RecordPropertiesChart } from "./chart/record-properties-chart";
import { RelationChart } from "./chart/relation-chart";

interface ChartComponentProps {
  data: ChartComponentData;
  recordId?: string;
}

export function ChartComponent({ data, recordId }: ChartComponentProps) {
  const t = useTranslations("RecordPage.inspector");
  if (!data?.source) {
    return <ChartPlaceholder title={data?.title} message={t("incompleteChartConfig")} />;
  }
  if (data.source.type === "record-properties") {
    return <RecordPropertiesChart data={data} recordId={recordId} />;
  }
  return <RelationChart data={data} recordId={recordId} />;
}
