"use client";

import { useAppContext } from "@/context/app-context";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

export function DashboardView() {
  const t = useTranslations("Dashboard");
  const { user, isLoading } = useAppContext();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || isLoading || !user) return null;

  return (
    <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
      <main className="flex-1 overflow-y-auto scrollbar p-6 md:p-8 lg:p-10">
        <h1 className="text-3xl font-semibold text-ink">
          {t("welcome")}, <span className="text-accent">{user.username}</span>
        </h1>
        <p className="mt-2 text-sm text-ink-secondary">{t("tradingOverview")}</p>
      </main>
    </div>
  );
}
