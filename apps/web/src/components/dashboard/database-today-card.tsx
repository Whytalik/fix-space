import { Card } from "@/components/ui/primitives/display/card";
import { Link } from "@/i18n/navigation";
import { DatabaseIcon } from "lucide-react";
import { IconDisplay } from "@/components/ui/icons/icon-display";
import type { TodayRecord } from "@fixspace/domain";
import { useTranslations } from "next-intl";

interface DatabaseTodayCardProps {
  title: string;
  records: TodayRecord[];
  databaseId?: string;
}

export function DatabaseTodayCard({ title, records, databaseId }: DatabaseTodayCardProps) {
  const t = useTranslations("Dashboard");
  const recentRecords = records.slice(0, 3);

  return (
    <Card className="h-full flex flex-col hover:border-border-hover transition-colors duration-150">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <DatabaseIcon className="w-5 h-5 text-accent" />
          <h3 className="type-panel-title">{title}</h3>
        </div>
        <span className="text-2xl font-semibold">{records.length}</span>
      </div>

      <div className="flex-1 flex flex-col">
        {records.length === 0 ? (
          <p className="text-sm text-ink-secondary italic mt-2">{t("noRecordsToday")}</p>
        ) : (
          recentRecords.map((record) => (
            <Link
              key={record.id}
              href={`/record/${record.id}`}
              className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-surface-hover transition-colors duration-150 group"
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
        <div className="mt-4 pt-4 border-t border-border flex justify-end">
          <Link
            href={`/database/${databaseId}`}
            className="text-sm text-accent hover:text-accent-hover transition-colors duration-150 font-medium"
          >
            {t("viewAll")} →
          </Link>
        </div>
      )}
    </Card>
  );
}
