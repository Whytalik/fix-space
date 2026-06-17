"use client";

import { DailyWorkflow } from "@/components/dashboard/daily-workflow";
import { MarketSessions } from "@/components/dashboard/market-sessions";
import { DatabaseTodayCard } from "@/components/dashboard/database-today-card";
import type { CardVariant } from "@/components/dashboard/database-today-card";
import { useAppContext } from "@/context/app-context";
import { PageLoader } from "@/components/ui/primitives/feedback/page-loader";
import { EmptyState } from "@/components/ui/primitives/display/empty-state";
import { getDashboard } from "@/lib/api/space";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/api/query-keys";
import { useEffect, useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { TrendingUp, ClipboardList, FileText, AlertTriangle } from "lucide-react";

interface CardConfig {
  title: string;
  records: { id: string; name: string; icon: string | null }[];
  databaseId?: string;
  variant: CardVariant;
  icon: ReactNode;
}

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

  const todayItems: CardConfig[] = dashboard
    ? [
        {
          title: dashboard.todayItems.tradingJournal.name,
          records: dashboard.todayItems.tradingJournal.records,
          databaseId: dashboard.todayItems.tradingJournal.databaseId,
          variant: "success",
          icon: <TrendingUp size={18} />,
        },
        {
          title: dashboard.todayItems.dailyRoutine.name,
          records: dashboard.todayItems.dailyRoutine.records,
          databaseId: dashboard.todayItems.dailyRoutine.databaseId,
          variant: "accent",
          icon: <ClipboardList size={18} />,
        },
        {
          title: dashboard.todayItems.notes.name,
          records: dashboard.todayItems.notes.records,
          databaseId: dashboard.todayItems.notes.databaseId,
          variant: "warning",
          icon: <FileText size={18} />,
        },
        {
          title: dashboard.todayItems.mistakes.name,
          records: dashboard.todayItems.mistakes.records,
          databaseId: dashboard.todayItems.mistakes.databaseId,
          variant: "error",
          icon: <AlertTriangle size={18} />,
        },
      ]
    : [];

  const totalRecords = todayItems.reduce((sum, item) => sum + item.records.length, 0);

  return (
    <div className="flex-1 flex flex-col min-w-0 overflow-hidden animate-fade-up">
      <main className="flex-1 overflow-y-auto no-scrollbar p-6 md:p-8 lg:p-10">
        {!space && (
          <div className="mt-8">
            <EmptyState title={t("noSpace")} description={t("noSpaceDesc")} />
          </div>
        )}

        {isDashboardLoading && <PageLoader />}

        {dashboard && space && (
          <div className="flex flex-col gap-6 max-w-[1600px]">
            <div className="flex flex-col xl:flex-row gap-6">
              <div className="flex-[1.2] bg-surface border border-stroke rounded-2xl p-6 flex flex-col justify-between relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-32 bg-accent/5 rounded-full blur-[100px] -mr-16 -mt-16 transition-opacity duration-500 group-hover:bg-accent/10 pointer-events-none" />
                <div className="absolute top-0 left-0 w-1 h-full bg-accent/80" />

                <div className="relative z-10 mb-4">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="h-1.5 w-1.5 rounded-full bg-success animate-pulse shadow-[0_0_8px_rgba(87,242,135,0.6)]" />
                    <span className="text-[10px] font-semibold uppercase tracking-widest text-ink-muted font-mono">System Active</span>
                  </div>

                  <h1 className="text-2xl sm:text-3xl font-bold text-ink tracking-tight">
                    {t("welcome")}, <span className="text-ink">{user.username}</span>
                  </h1>
                  <p className="mt-1 text-sm text-ink-secondary">{t("tradingOverview")}</p>
                </div>

                <div className="relative z-10">
                  <div className="inline-flex flex-col gap-0.5 px-4 py-2.5 rounded-xl bg-canvas border border-stroke min-w-[120px]">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-ink-muted">{t("recordsToday")}</span>
                    <span className="text-2xl font-mono tabular-nums font-bold text-ink">{totalRecords}</span>
                  </div>
                </div>
              </div>
              <div className="xl:w-[60%] shrink-0">
                <MarketSessions data={dashboard.marketSessions} />
              </div>
            </div>

            <div className="w-full">
              <DailyWorkflow steps={dashboard.dailyWorkflow} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {todayItems.map((item) => (
                <DatabaseTodayCard
                  key={item.variant}
                  title={item.title}
                  records={item.records}
                  databaseId={item.databaseId}
                  variant={item.variant}
                  icon={item.icon}
                />
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
