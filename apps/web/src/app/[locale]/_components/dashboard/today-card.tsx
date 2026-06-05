"use client";

import { Card } from "@/components/ui/primitives/display/card";
import { Inbox, Plus, FileText } from "lucide-react";
import { Button } from "@/components/ui/primitives/actions/button";
import type { RecordResponseDto } from "@fixspace/domain";
import { IconDisplay } from "@/components/ui/icons/icon-display";
import { useTranslations, useFormatter } from "next-intl";

interface TodayCardProps {
  title: string;
  records?: RecordResponseDto[];
  iconColor?: string;
  onAdd?: () => void;
  isLoading?: boolean;
}

export function TodayCard({ title, records = [], iconColor = "text-ink-muted", onAdd, isLoading }: TodayCardProps) {
  const t = useTranslations("Dashboard");
  const format = useFormatter();
  const count = records.length;

  return (
    <Card className="flex flex-col h-48 hover:border-stroke-subtle transition-colors duration-200">
      <div className="flex items-center justify-between border-b border-stroke pb-3 mb-3">
        <h3 className="font-medium text-ink">{title}</h3>
        <div className="flex items-center gap-3">
          <span className="text-xs text-ink-secondary">
            {count} {t("recordsToday")}
          </span>
          <Button variant="ghost" size="icon" onClick={onAdd} className="h-6 w-6 text-ink-muted hover:text-accent">
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="w-5 h-5 rounded-full border-2 border-stroke border-t-accent animate-spin" />
        </div>
      ) : count === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-3">
          <div className="p-3 bg-canvas rounded-full">
            <Inbox className={`w-6 h-6 opacity-80 ${iconColor}`} />
          </div>
          <p className="text-sm text-ink-secondary">{t("noRecordsToday")}</p>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto scrollbar flex flex-col gap-1 pr-1">
          {records.map((record) => (
            <div key={record.id} className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-ink">
              <span className="text-ink-muted leading-none flex-shrink-0 flex items-center">
                {record.icon ? <IconDisplay value={record.icon} size={14} /> : <FileText size={14} />}
              </span>
              <span className="text-sm text-ink truncate flex-1">{record.name || t("untitled")}</span>
              <span className="text-xs text-ink-secondary shrink-0">
                {format.dateTime(new Date(record.createdAt), { hour: "2-digit", minute: "2-digit" })}
              </span>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
