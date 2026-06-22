"use client";

import { useState } from "react";
import { Eye, RotateCcw } from "lucide-react";
import dayjs from "dayjs";
import { useTranslations } from "next-intl";

import { useRecordContentSnapshotsQuery } from "@/hooks/api/use-record-content-query";
import { useRecordContentMutations } from "@/hooks/api/use-record-content-mutations";
import { Spinner } from "@/components/ui/primitives/feedback/spinner";
import type { ContentEditorState } from "@/app/[locale]/(dashboard)/record/[id]/_components/content-area/lib/use-content-editor";
import type { RecordContentSnapshotResponseDto } from "@fixspace/domain";
import { SnapshotPreviewModal } from "../snapshot-preview-modal";

interface HistoryTabProps {
  recordId: string;
  editor: ContentEditorState;
}

export function HistoryTab({ recordId, editor }: HistoryTabProps) {
  const t = useTranslations("RecordPage");
  const { data: snapshots, isLoading } = useRecordContentSnapshotsQuery(recordId);
  const { restoreMutation } = useRecordContentMutations(recordId);
  const [previewSnapshot, setPreviewSnapshot] = useState<RecordContentSnapshotResponseDto | null>(null);

  if (isLoading) {
    return (
      <div className="py-8 flex justify-center">
        <Spinner size="sm" />
      </div>
    );
  }

  if (!snapshots?.length) {
    return <p className="px-3 py-4 text-xs text-ink-muted italic text-center">{t("noHistory")}</p>;
  }

  return (
    <div className="space-y-1">
      {snapshots.map((snapshot) => (
        <div
          key={snapshot.id}
          className="group flex items-start justify-between gap-2 px-3 py-2 rounded-2xl hover:bg-surface-hover transition-colors duration-150"
        >
          <div className="min-w-0">
            <p className="text-xs font-medium text-ink">{dayjs(snapshot.createdAt).format("DD MMM, HH:mm")}</p>
            <p className="type-hint">
              {snapshot.content.rows.length} {t("rows")}
            </p>
          </div>
          <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              type="button"
              onClick={() => setPreviewSnapshot(snapshot)}
              title={t("viewVersion")}
              className="p-1.5 text-ink-muted hover:text-ink hover:bg-hover rounded-lg transition-all duration-150"
            >
              <Eye size={12} />
            </button>
            <button
              type="button"
              onClick={() => restoreMutation.mutate(snapshot.id)}
              disabled={restoreMutation.isPending}
              title={t("restore")}
              className="p-1.5 text-accent hover:bg-accent/10 rounded-lg transition-all duration-150"
            >
              {restoreMutation.isPending ? <Spinner size="sm" /> : <RotateCcw size={12} />}
            </button>
          </div>
        </div>
      ))}

      {previewSnapshot && (
        <SnapshotPreviewModal
          isOpen={!!previewSnapshot}
          onClose={() => setPreviewSnapshot(null)}
          snapshot={previewSnapshot}
          currentContent={editor.content}
          isRestoring={restoreMutation.isPending}
          onRestore={() => {
            restoreMutation.mutate(previewSnapshot.id);
            setPreviewSnapshot(null);
          }}
        />
      )}
    </div>
  );
}
