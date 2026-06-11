"use client";

import { useState } from "react";
import { useRecordContentSnapshotsQuery } from "@/hooks/api/use-record-content-query";
import { useRecordContentMutations } from "@/hooks/api/use-record-content-mutations";
import { useTranslations } from "next-intl";
import { History, RotateCcw, X } from "lucide-react";
import { Button } from "@/components/ui/primitives/actions/button";
import { Spinner } from "@/components/ui/primitives/feedback/spinner";
import dayjs from "dayjs";

interface SnapshotHistoryProps {
  recordId: string;
}

export function SnapshotHistory({ recordId }: SnapshotHistoryProps) {
  const t = useTranslations("RecordPage");
  const { data: snapshots, isLoading } = useRecordContentSnapshotsQuery(recordId);
  const { restoreMutation } = useRecordContentMutations(recordId);
  const [isOpen, setIsOpen] = useState(false);

  if (!isOpen) {
    return (
      <Button variant="ghost" size="sm" leftIcon={<History size={14} />} onClick={() => setIsOpen(true)}>
        {t("history")}
      </Button>
    );
  }

  return (
    <div className="fixed inset-y-0 right-0 w-80 bg-surface border-l border-stroke z-50 flex flex-col animate-fade-up">
      <div className="p-4 border-b border-stroke flex items-center justify-between">
        <h3 className="type-panel-title flex items-center gap-2">
          <History size={18} />
          {t("contentHistory")}
        </h3>
        <button
          type="button"
          onClick={() => setIsOpen(false)}
          aria-label="Close history"
          className="p-1 text-ink-muted hover:text-ink hover:bg-hover rounded-lg transition-colors duration-150"
        >
          <X size={18} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar p-2 space-y-1">
        {isLoading ? (
          <div className="py-8 flex justify-center">
            <Spinner size="sm" />
          </div>
        ) : !snapshots?.length ? (
          <div className="py-8 text-center text-ink-muted text-sm italic">{t("noHistory")}</div>
        ) : (
          snapshots.map((snapshot) => (
            <div
              key={snapshot.id}
              className="group p-3 rounded-2xl border border-transparent hover:border-stroke hover:bg-hover transition-colors duration-150"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-ink">{dayjs(snapshot.createdAt).format("DD MMM, HH:mm:ss")}</span>
                <button
                  type="button"
                  onClick={() => restoreMutation.mutate(snapshot.id)}
                  disabled={restoreMutation.isPending}
                  aria-label="Restore this snapshot"
                  className="p-1.5 opacity-0 group-hover:opacity-100 text-accent hover:bg-accent/10 rounded-lg transition-all duration-150"
                >
                  {restoreMutation.isPending ? <Spinner size="sm" /> : <RotateCcw size={14} />}
                </button>
              </div>
              <p className="text-xs text-ink-muted mt-0.5">
                {snapshot.content.rows.length} {t("rows")}
              </p>
            </div>
          ))
        )}
      </div>

      <div className="p-3 bg-canvas border-t border-stroke">
        <p className="text-xs text-ink-muted italic">{t("snapshotHint")}</p>
      </div>
    </div>
  );
}
