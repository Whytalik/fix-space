"use client";

import { DailyWorkflow } from "@/components/dashboard/daily-workflow";
import { MarketSessions } from "@/components/dashboard/market-sessions";
import { DatabaseTodayCard } from "@/components/dashboard/database-today-card";
import { useAppContext } from "@/context/app-context";
import { PageLoader } from "@/components/ui/primitives/feedback/page-loader";
import { EmptyState } from "@/components/ui/primitives/display/empty-state";
import { getDashboard } from "@/lib/api/space";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/api/query-keys";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

export function DashboardView() {
  const t = useTranslations("Dashboard");
  const { user, isLoading: isContextLoading, space } = useAppContext();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const { data: dashboard, isPending: isDashboardLoading } = useQuery({
    queryKey: queryKeys.spaces.dashboard(space?.id ?? ""),
    queryFn: () => getDashboard(space!.id),
    enabled: !!space,
  });

  if (!mounted || isContextLoading || !user) {
    return <PageLoader className="flex-1" />;
  }

  return (
    <div className="flex-1 flex flex-col min-w-0 overflow-hidden animate-fade-up">
      <main className="flex-1 overflow-y-auto scrollbar p-6 md:p-8 lg:p-10">
        {!space && (
          <div className="mt-8">
            <EmptyState title={t("noSpace")} description={t("noSpaceDesc")} />
          </div>
        )}

        {isDashboardLoading && <PageLoader />}

        {dashboard && space && (
          <div className="flex flex-col gap-6">
            <div className="flex flex-col xl:flex-row gap-6">
              <div className="flex-1 bg-surface border border-border rounded-xl p-6 flex flex-col justify-center">
                <h1 className="type-page-title">
                  {t("welcome")}, <span className="text-accent">{user.username}</span>
                </h1>
                <p className="mt-2 text-sm text-ink-secondary">{t("tradingOverview")}</p>
              </div>
              <div className="xl:w-[60%] shrink-0">
                <MarketSessions data={dashboard.marketSessions} />
              </div>
            </div>

            <div className="w-full">
              <DailyWorkflow steps={dashboard.dailyWorkflow} spaceId={space.id} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <DatabaseTodayCard
                title={dashboard.todayItems.tradingJournal.title}
                records={dashboard.todayItems.tradingJournal.records}
                spaceId={space.id}
                databaseId={dashboard.todayItems.tradingJournal.databaseId}
              />
              <DatabaseTodayCard
                title={dashboard.todayItems.dailyRoutine.title}
                records={dashboard.todayItems.dailyRoutine.records}
                spaceId={space.id}
                databaseId={dashboard.todayItems.dailyRoutine.databaseId}
              />
              <DatabaseTodayCard
                title={dashboard.todayItems.notes.title}
                records={dashboard.todayItems.notes.records}
                spaceId={space.id}
                databaseId={dashboard.todayItems.notes.databaseId}
              />
              <DatabaseTodayCard
                title={dashboard.todayItems.mistakes.title}
                records={dashboard.todayItems.mistakes.records}
                spaceId={space.id}
                databaseId={dashboard.todayItems.mistakes.databaseId}
              />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
