"use client";

import { Card } from "@/components/ui/primitives/display/card";
import type { MarketSession } from "@fixspace/domain";
import { Globe } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { StatusDot } from "@/components/ui/primitives/display/badge";

interface MarketSessionsProps {
  data: {
    dayOfWeek: string;
    activeSessions: MarketSession[];
    nextSessionOpening: string;
  };
}

const ALL_SESSIONS = ["Tokyo", "Frankfurt", "London", "New York"];

function getNextSessionLabel(nextUtc: string, locale: string, now: Date): string {
  const [hours, minutes] = nextUtc.split(":");
  if (!hours) return nextUtc;
  const d = new Date(now);
  d.setUTCHours(Number(hours), minutes ? Number(minutes) : 0, 0, 0);

  if (d <= now) {
    d.setDate(d.getDate() + 1);
  }

  const timeStr = d.toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit", hour12: false });
  const dayDiff = Math.round((d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  if (dayDiff === 0) return timeStr;

  const dayName = d.toLocaleDateString(locale, { weekday: "long" });
  return `${dayName} ${timeStr}`;
}

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

  const isWeekend = now ? now.getDay() === 0 || now.getDay() === 6 : false;

  return (
    <Card className="h-full flex flex-col justify-center p-6 relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-32 bg-surface-hover/20 rounded-full blur-[80px] -mr-20 -mt-20 pointer-events-none" />
      <div className="relative z-10 flex items-center justify-between mb-5">
        <h2 className="text-lg font-bold text-ink flex items-center gap-2.5">
          <Globe className="w-5 h-5 text-accent" />
          {t("overview")}
        </h2>
        <span
          className={`text-[11px] uppercase tracking-wider font-mono tabular-nums px-3 py-1.5 rounded-lg border ${
            isWeekend ? "text-error border-error/20 bg-error-bg/50" : "text-ink-secondary border-stroke/50 bg-canvas/30"
          }`}
        >
          {displayTime}
        </span>
      </div>

      <div className="relative z-10 flex gap-3">
        {ALL_SESSIONS.map((sessionName) => {
          const isActive = activeNames.includes(sessionName);
          const key = sessionName.toLowerCase().replace(" ", "");
          const sessionKey = key === "newyork" ? "newYork" : key;
          return (
            <div
              key={sessionName}
              className={`flex-1 rounded-xl px-3 py-2.5 text-center transition-all duration-300 border ${
                isActive ? "border-success/30 bg-success-bg/40 shadow-[0_0_15px_rgba(87,242,135,0.05)]" : "border-stroke/50 bg-canvas/30"
              }`}
            >
              <div className={`text-[13px] font-semibold tracking-wide ${isActive ? "text-success" : "text-ink-muted"}`}>
                {sessionT(sessionKey as Parameters<typeof sessionT>[0])}
              </div>
              <div className="mt-1 flex items-center justify-center gap-1.5">
                <StatusDot variant={isActive ? "success" : "neutral"} label={isActive ? t("active") : t("closed")} />
              </div>
            </div>
          );
        })}
      </div>

      <div className="relative z-10 mt-5 pt-4 border-t border-stroke/50 flex items-center gap-2.5">
        <span className="w-1.5 h-1.5 rounded-full bg-accent/80 animate-pulse shadow-[0_0_8px_rgba(37,99,235,0.4)]" />
        <span className="text-[11px] uppercase tracking-wider font-semibold text-ink-muted">{t("next")}</span>
        <span className="text-[13px] font-semibold font-mono tabular-nums text-ink">
          {now ? getNextSessionLabel(data.nextSessionOpening, locale, now) : data.nextSessionOpening}
        </span>
      </div>
    </Card>
  );
}
