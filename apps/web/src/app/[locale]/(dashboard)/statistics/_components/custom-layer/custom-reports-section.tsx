"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/primitives/actions/button";
import { Spinner } from "@/components/ui/primitives/feedback/spinner";
import { useCustomStatsQuery } from "@/hooks/api/use-custom-stats-query";
import type { StatisticsQuery } from "@/lib/api/statistics";
import { CustomReportCard } from "./custom-report-card";

interface CustomReportsSectionProps {
  query: StatisticsQuery;
}

export function CustomReportsSection({ query }: CustomReportsSectionProps) {
  const t = useTranslations("Statistics");
  const { data, isPending, isError, refetch } = useCustomStatsQuery(query);

  if (isPending) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner size="md" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <p className="text-error text-sm">{t("loadError")}</p>
        <Button variant="secondary" size="sm" onClick={() => refetch()}>
          {t("retry")}
        </Button>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-2 text-center">
        <p className="text-ink-secondary text-sm">{t("customEmpty")}</p>
        <p className="text-ink-muted text-xs max-w-sm">{t("customEmptyHint")}</p>
      </div>
    );
  }

  return (
    <div>
      {data.map((report) => (
        <CustomReportCard key={report.databaseId} report={report} />
      ))}
    </div>
  );
}
