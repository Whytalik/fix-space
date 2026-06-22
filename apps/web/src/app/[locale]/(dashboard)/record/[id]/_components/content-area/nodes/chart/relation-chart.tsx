"use client";

import { useMemo, Suspense } from "react";
import { useTranslations } from "next-intl";
import type { ChartComponentData } from "@fixspace/domain";
import { useRecordQuery } from "@/hooks/api/use-record-query";
import { useAppContext } from "@/context/app-context";
import { DatabaseProvider } from "@/context/database-context";
import { Spinner } from "@/components/ui/primitives/feedback/spinner";
import { ChartPlaceholder } from "./chart-placeholder";
import { RelationChartInner } from "./relation-chart-inner";

interface RelationChartProps {
  data: ChartComponentData;
  recordId?: string;
}

export function RelationChart({ data, recordId }: RelationChartProps) {
  const t = useTranslations("RecordPage.inspector");
  const { data: record } = useRecordQuery(recordId ?? "", { enabled: Boolean(recordId) });
  const source = data.source.type === "relation" ? data.source : null;
  const { databases } = useAppContext();

  const relationIds = useMemo<string[]>(() => {
    if (!record?.values || !source) return [];
    const propertyValue = record.values.find((valueItem) => valueItem.propertyName === source.relationField);
    if (!propertyValue?.value) return [];
    return Array.isArray(propertyValue.value) ? (propertyValue.value as string[]) : [propertyValue.value as string];
  }, [record, source]);

  const targetDatabase = useMemo(() => {
    if (!source) return null;
    return databases.find((database) => {
      const databaseWithPossibleType = database as unknown as { type?: string };
      return (
        databaseWithPossibleType.type === source.relationField ||
        database.name?.toLowerCase().includes((source.relationField || "").toLowerCase())
      );
    });
  }, [databases, source]);

  if (!recordId || !source) return <ChartPlaceholder title={data.title} message={t("configureRelationSource")} />;
  if (!relationIds.length) return <ChartPlaceholder title={data.title} message={t("noLinkedRecords")} />;

  const firstDatabase = databases[0];
  const databaseId = targetDatabase?.id ?? firstDatabase?.id;
  if (!databaseId) return <ChartPlaceholder title={data.title} message={t("noDatabaseAvailable")} />;

  return (
    <Suspense
      fallback={
        <div className="py-6 flex justify-center">
          <Spinner size="sm" />
        </div>
      }
    >
      <DatabaseProvider databaseId={databaseId} skipStateUpdate={true}>
        <RelationChartInner data={data} relationIds={relationIds} />
      </DatabaseProvider>
    </Suspense>
  );
}
