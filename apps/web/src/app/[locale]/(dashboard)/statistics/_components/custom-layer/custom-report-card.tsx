"use client";

import { useTranslations } from "next-intl";
import { IconDisplay } from "@/components/ui/icons/icon-display";
import type { CustomReportDto } from "@fixspace/domain";
import { SelectBreakdownChart } from "./select-breakdown-chart";
import { NumberSeriesChart } from "./number-series-chart";

interface CustomReportCardProps {
  report: CustomReportDto;
}

export function CustomReportCard({ report }: CustomReportCardProps) {
  const t = useTranslations("Statistics");

  const nonEmptyBreakdowns = report.breakdowns.filter((group) => group.items.length > 0);
  const nonEmptySeries = report.numberSeries.filter((s) => s.points.length > 0);

  return (
    <div className="mb-8">
      <div className="flex items-center gap-2 mb-4">
        <IconDisplay value={report.icon ?? "📋"} size={20} />
        <h2 className="type-panel-title">{report.name}</h2>
        <span className="text-xs text-ink-muted ml-1">{t("recordCount", { count: report.recordCount })}</span>
      </div>

      {nonEmptyBreakdowns.length === 0 && nonEmptySeries.length === 0 ? (
        <p className="text-ink-muted text-sm">{t("noDataForPeriod")}</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {nonEmptyBreakdowns.map((group) => (
            <SelectBreakdownChart key={group.propertyName} group={group} />
          ))}
          {nonEmptySeries.map((series) => (
            <NumberSeriesChart key={series.propertyName} series={series} />
          ))}
        </div>
      )}
    </div>
  );
}
