import { Card } from "@/components/ui/primitives/display/card";
import { Link } from "@/i18n/navigation";
import { IconDisplay } from "@/components/ui/icons/icon-display";
import type { TodayRecord } from "@fixspace/domain";
import { useTranslations } from "next-intl";
import type { ReactNode } from "react";

export type CardVariant = "success" | "accent" | "warning" | "error";

interface DatabaseTodayCardProps {
  title: string;
  records: TodayRecord[];
  databaseId?: string;
  variant: CardVariant;
  icon: ReactNode;
}

const variantStyles: Record<CardVariant, { border: string; iconColor: string; badge: string }> = {
  success: {
    border: "border-l-success",
    iconColor: "text-success",
    badge: "bg-success-bg text-success",
  },
  accent: {
    border: "border-l-accent",
    iconColor: "text-accent",
    badge: "bg-accent/10 text-accent",
  },
  warning: {
    border: "border-l-warning",
    iconColor: "text-warning",
    badge: "bg-warning-bg text-warning",
  },
  error: {
    border: "border-l-error",
    iconColor: "text-error",
    badge: "bg-error-bg text-error",
  },
};

export function DatabaseTodayCard({ title, records, databaseId, variant, icon }: DatabaseTodayCardProps) {
  const t = useTranslations("Dashboard");
  const recentRecords = records.slice(0, 3);
  const styles = variantStyles[variant];

  return (
    <Card className={`h-full flex flex-col border-l-2 ${styles.border} transition-colors duration-150`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <span className={styles.iconColor}>{icon}</span>
          <h3 className="type-panel-title">{title}</h3>
        </div>
        <span className={`text-2xl font-bold font-mono tabular-nums ${styles.iconColor}`}>{records.length}</span>
      </div>

      <div className="flex-1 flex flex-col gap-1">
        {records.length === 0 ? (
          <p className="text-sm text-ink-secondary mt-2">{t("noRecordsToday")}</p>
        ) : (
          recentRecords.map((record) => (
            <Link
              key={record.id}
              href={`/record/${record.id}`}
              className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg hover:bg-surface-hover transition-colors duration-150 group"
            >
              <span className="shrink-0 text-ink-muted">
                <IconDisplay value={record.icon ?? "icon:FileText"} size={14} />
              </span>
              <span className="text-sm text-ink group-hover:text-accent truncate transition-colors duration-150">
                {record.name || t("untitled")}
              </span>
            </Link>
          ))
        )}
      </div>

      {databaseId && (
        <div className="mt-5 pt-4 border-t border-stroke/50 flex items-center justify-between">
          <span
            className={`text-[10px] uppercase tracking-widest font-mono font-medium px-2.5 py-1 rounded border border-current/20 ${styles.badge}`}
          >
            {records.length} {t("recordsCount", { count: records.length })}
          </span>
          <Link
            href={`/database/${databaseId}`}
            className="text-[11px] uppercase tracking-wider text-ink-muted hover:text-accent transition-colors duration-150 font-semibold flex items-center gap-1"
          >
            {t("viewAll")} <span className="text-[14px]">→</span>
          </Link>
        </div>
      )}
    </Card>
  );
}
