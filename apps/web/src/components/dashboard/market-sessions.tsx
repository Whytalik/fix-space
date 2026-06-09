"use client";

import { Card } from "@/components/ui/primitives/display/card";
import type { MarketSession } from "@fixspace/domain";
import { Clock } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslations, useLocale } from "next-intl";

interface MarketSessionsProps {
  data: {
    dayOfWeek: string;
    activeSessions: MarketSession[];
    nextSessionOpening: string;
  };
}

const ALL_SESSIONS = ["Tokyo", "Frankfurt", "London", "New York"];

export function MarketSessions({ data }: MarketSessionsProps) {
  const t = useTranslations("Dashboard");
  const sessionT = useTranslations("SessionIndicator");
  const locale = useLocale();
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const activeNames = data.activeSessions.map((s) => s.name);

  const displayTime = now
    ? new Intl.DateTimeFormat(locale, {
        weekday: "long",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      })
        .format(now)
        .replace(/^./, (str) => str.toUpperCase())
    : data.dayOfWeek;

  const isWeekendServer = data.dayOfWeek === "Saturday" || data.dayOfWeek === "Sunday";
  const isWeekend = now ? now.getDay() === 0 || now.getDay() === 6 : isWeekendServer;

  return (
    <Card className="h-full flex flex-col justify-center">
      <div className="flex items-center justify-between mb-4">
        <h2 className="type-panel-title flex items-center gap-2">
          <Clock className="w-5 h-5 text-accent" />
          {t("overview")}
        </h2>
        <span
          className={`text-sm font-medium px-3 py-1 rounded-full border min-w-[200px] text-center ${
            isWeekend ? "text-error border-error/50 bg-error-bg" : "text-ink-secondary bg-surface border-border"
          }`}
        >
          {displayTime}
        </span>
      </div>

      <div className="flex gap-2">
        {ALL_SESSIONS.map((sessionName) => {
          const isActive = activeNames.includes(sessionName);
          const key = sessionName.toLowerCase().replace(" ", "");
          const sessionKey = key === "newyork" ? "newYork" : key;
          return (
            <div
              key={sessionName}
              className={`flex-1 rounded-xl p-3 text-center transition-colors border ${
                isActive ? "bg-success-bg border-success text-success font-medium" : "bg-surface border-border text-ink-muted"
              }`}
            >
              <div className="text-sm">{sessionT(sessionKey as Parameters<typeof sessionT>[0])}</div>
              <div className="text-xs mt-1 opacity-80">{isActive ? t("active") : t("closed")}</div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 text-sm text-ink-secondary flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
        {t("next")} {t("sessionIndicator.opensAt")} <span className="font-semibold text-ink">{data.nextSessionOpening}</span>
      </div>
    </Card>
  );
}
