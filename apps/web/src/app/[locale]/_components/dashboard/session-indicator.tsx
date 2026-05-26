"use client";
import { useEffect, useState } from "react";
import { Clock } from "lucide-react";
import { useTranslations, useFormatter } from "next-intl";

interface NextSessionData {
  name: string;
  timeStr: string;
  dateStr: string;
  color: string;
}

interface SessionData {
  name: string;
  color: string;
}

export function SessionIndicator() {
  const [activeSessions, setActiveSessions] = useState<SessionData[]>([]);
  const [time, setTime] = useState<string>("");
  const [currentDate, setCurrentDate] = useState<string>("");
  const [nextSession, setNextSession] = useState<NextSessionData | null>(null);
  const t = useTranslations("SessionIndicator");
  const format = useFormatter();

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTime(format.dateTime(now, { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false }));
      setCurrentDate(format.dateTime(now, { weekday: "long", month: "short", day: "numeric" }));

      const hour = now.getUTCHours();
      const minutes = now.getUTCMinutes();
      const currentUTCMinutes = hour * 60 + minutes;

      // Current sessions
      const sessions: SessionData[] = [];

      // Tokyo: 00:00 - 09:00 JST (23:00 - 08:00 UTC)
      // Tokyo Lunch: 11:30 - 12:30 JST (02:30 - 03:30 UTC)
      if (hour >= 23 || hour < 8) {
        const tokyoLunch = (hour === 2 && minutes >= 30) || (hour === 3 && minutes < 30);
        sessions.push({
          name: tokyoLunch ? t("tokyoLunch") : t("tokyo"),
          color: tokyoLunch ? "text-ink-muted" : "text-error",
        });
      }

      // Frankfurt (DAX Open): 08:00 - 17:30 CET (07:00 - 16:30 UTC)
      // Displaying only until 10:00 UTC as major volume shifts to London
      if (hour >= 7 && hour < 10) {
        sessions.push({ name: t("frankfurt"), color: "text-warning" });
      }

      // London: 08:00 - 16:30 GMT (08:00 - 16:30 UTC)
      // London Lunch (Low Vol): 12:00 - 13:00 UTC
      if (hour >= 8 && hour < 17) {
        const londonLunch = hour === 12;
        sessions.push({
          name: londonLunch ? t("londonLunch") : t("london"),
          color: londonLunch ? "text-ink-muted" : "text-success",
        });
      }

      // New York: 08:00 - 17:00 EST (13:00 - 22:00 UTC)
      // NY Lunch (Low Vol): 17:00 - 18:00 UTC (12:00 - 13:00 EST)
      if (hour >= 13 && hour < 22) {
        const nyLunch = hour === 17;
        sessions.push({
          name: nyLunch ? t("nyLunch") : t("newYork"),
          color: nyLunch ? "text-ink-muted" : "text-accent",
        });
      }

      setActiveSessions(sessions);

      // Next session logic
      const schedule = [
        { name: t("frankfurt"), startUTC: 7, color: "text-warning" },
        { name: t("london"), startUTC: 8, color: "text-success" },
        { name: t("newYork"), startUTC: 13, color: "text-accent" },
        { name: t("tokyo"), startUTC: 23, color: "text-error" },
      ];

      let nextS = schedule.find((s) => s.startUTC * 60 > currentUTCMinutes);
      const nextDate = new Date(now);

      if (!nextS) {
        nextS = schedule[0] as { name: string; startUTC: number; color: string };
        nextDate.setUTCDate(nextDate.getUTCDate() + 1);
      }

      nextDate.setUTCHours(nextS.startUTC, 0, 0, 0);

      const timeStr = format.dateTime(nextDate, { hour: "2-digit", minute: "2-digit", hour12: false });
      const isDifferentDay = nextDate.getDate() !== now.getDate() || nextDate.getMonth() !== now.getMonth();
      const dateStr = isDifferentDay ? format.dateTime(nextDate, { day: "numeric", month: "short" }) : "";

      setNextSession({ name: nextS.name, timeStr, dateStr, color: nextS.color });
    };

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [format, t]);

  return (
    <div className="flex flex-col items-end bg-surface px-6 py-4 rounded-xl border border-stroke shadow-sm h-full justify-center">
      <div className="text-sm font-medium text-ink-secondary mb-1">{currentDate || t("loadingDate")}</div>
      <div className="text-3xl font-mono font-medium text-ink tracking-tight leading-none mb-3">
        {time || "00:00:00"}
      </div>

      <div className="flex items-center gap-2 mb-1 flex-wrap justify-end max-w-[240px]">
        {activeSessions.length > 0 ? (
          activeSessions.map((s, i) => (
            <div key={s.name} className="flex items-center gap-1.5">
              <span className="relative flex h-3 w-3">
                <span
                  className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-40 ${s.color.replace("text-", "bg-")}`}
                />
                <span className={`relative inline-flex rounded-full h-3 w-3 ${s.color.replace("text-", "bg-")}`} />
              </span>
              <span className={`text-xl font-semibold ${s.color}`}>{s.name}</span>
              {i < activeSessions.length - 1 && <span className="text-ink-muted mx-0.5">/</span>}
            </div>
          ))
        ) : (
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-ink-muted mr-1" />
            <span className="text-xl font-semibold text-ink-muted">{t("closed")}</span>
          </div>
        )}
      </div>

      {nextSession && (
        <div className="flex items-center gap-1.5 text-xs text-ink-muted mt-2 pt-2 border-t border-stroke w-full justify-end">
          <span className="font-medium text-ink-secondary">
            {t("next")}: <span className={nextSession.color}>{nextSession.name}</span>
          </span>
          <span>
            {t("at")} {nextSession.timeStr}
          </span>
          {nextSession.dateStr && (
            <span className="px-1.5 py-0.5 bg-canvas rounded border border-stroke-subtle">{nextSession.dateStr}</span>
          )}
        </div>
      )}
    </div>
  );
}
