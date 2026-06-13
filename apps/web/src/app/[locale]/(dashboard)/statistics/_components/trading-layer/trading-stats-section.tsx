"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/primitives/actions/button";
import { Spinner } from "@/components/ui/primitives/feedback/spinner";
import { useTradingStatsQuery } from "@/hooks/api/use-trading-stats-query";
import type { StatisticsQuery } from "@/lib/api/statistics";
import { MetricsGrid } from "./metrics-grid";
import { EquityChart } from "./equity-chart";
import { BreakdownSection } from "./breakdown-section";

interface TradingStatsSectionProps {
  query: StatisticsQuery;
}

export function TradingStatsSection({ query }: TradingStatsSectionProps) {
  const t = useTranslations("Statistics");
  const { data, isPending, isError, refetch } = useTradingStatsQuery(query);

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

  if (!data || data.metrics.totalTrades === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-2 text-center">
        <p className="text-ink-secondary text-sm">{t("emptyState")}</p>
        <p className="text-ink-muted text-xs max-w-sm">{t("emptyStateHint")}</p>
      </div>
    );
  }

  return (
    <div>
      <MetricsGrid metrics={data.metrics} compareMetrics={data.compareMetrics} />
      <EquityChart data={data.equityCurve} compareData={data.compareMetrics ? [] : undefined} />
      <BreakdownSection breakdowns={data.breakdowns} />
    </div>
  );
}
