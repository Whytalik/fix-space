"use client";

import { useParams } from "next/navigation";
import { useRecordQuery } from "@/hooks/api/use-record-query";
import { usePropertiesQuery } from "@/hooks/api/use-properties-query";
import { PageLoader } from "@/components/ui/primitives/feedback/page-loader";
import { useAppContext } from "@/context/app-context";
import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateRecord } from "@/lib/api/record";
import { RecordPropertyList } from "./_components/property-list";
import { RecordTemplateMenu } from "./_components/record-template-menu";
import { useTranslations } from "next-intl";
import { FileText, Eye, EyeOff } from "lucide-react";
import { IconDisplay } from "@/components/ui/icons/icon-display";
import { DatabaseProvider } from "@/context/database-context";

export default function RecordPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const { data: record, isLoading: isRecordLoading } = useRecordQuery(id);
  const { setCurrentDatabaseId } = useAppContext();
  const queryClient = useQueryClient();
  const tr = useTranslations("RecordPage");
  const [showMetadata, setShowMetadata] = useState(true);
  const [titleValue, setTitleValue] = useState("");
  const [isEditingTitle, setIsEditingTitle] = useState(false);

  const { data: properties = [], isLoading: isPropertiesLoading } = usePropertiesQuery(record?.databaseId || "", {
    enabled: !!record?.databaseId,
  });

  useEffect(() => {
    if (record?.name !== undefined && !isEditingTitle) setTitleValue(record.name ?? "");
  }, [record?.name, isEditingTitle]);

  useEffect(() => {
    if (record?.databaseId) {
      setCurrentDatabaseId(record.databaseId);
    }
    return () => setCurrentDatabaseId(null);
  }, [record?.databaseId, setCurrentDatabaseId]);

  const titleMutation = useMutation({
    mutationFn: (name: string) => updateRecord(id, { name }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["records", "detail", id] }),
  });

  function handleTitleSave() {
    const trimmed = titleValue.trim();
    if (trimmed !== (record?.name ?? "")) {
      titleMutation.mutate(trimmed || tr("untitled"));
    }
  }

  const isLoading = isRecordLoading || (isPropertiesLoading && !!record?.databaseId);

  if (isLoading) return <PageLoader />;

  return (
    <div className="flex-1 overflow-y-auto scrollbar animate-fade-up px-8 py-10">
      <div className="mb-8 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <span className="text-ink-muted shrink-0">
            {record?.icon ? <IconDisplay value={record.icon} size={28} /> : <FileText size={28} />}
          </span>
          <input
            type="text"
            className="type-page-title bg-transparent border-0 outline-none p-0 min-w-0 w-full placeholder:text-ink-muted"
            value={titleValue}
            placeholder={tr("untitled")}
            onChange={(e) => setTitleValue(e.target.value)}
            onFocus={() => setIsEditingTitle(true)}
            onBlur={() => {
              setIsEditingTitle(false);
              handleTitleSave();
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") e.currentTarget.blur();
            }}
          />
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowMetadata(!showMetadata)}
            className="p-2 rounded-lg text-ink-secondary hover:bg-surface-hover transition-colors"
            title={showMetadata ? tr("hideMetadata") : tr("showMetadata")}
          >
            {showMetadata ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
          {record && <RecordTemplateMenu recordId={record.id} databaseId={record.databaseId} />}
        </div>
      </div>

      <div className={`grid gap-8 mb-8 ${showMetadata ? "grid-cols-1 lg:grid-cols-4" : "grid-cols-1"}`}>
        <div className={`${showMetadata ? "lg:col-span-3" : ""} space-y-8`}>
          <section>
            <div className="card p-4">
              <DatabaseProvider databaseId={record?.databaseId}>
                <RecordPropertyList properties={properties} record={record!} />
              </DatabaseProvider>
            </div>
          </section>
        </div>

        {showMetadata && (
          <div className="space-y-8">
            <section>
              <div className="card p-6 space-y-5">
                <div className="flex flex-col gap-1.5">
                  <span className="type-nav-label text-ink-muted">{tr("created")}</span>
                  <span className="text-sm text-ink-secondary font-mono">
                    {record?.createdAt ? new Date(record.createdAt).toLocaleString() : "—"}
                  </span>
                </div>
                <div className="flex flex-col gap-1.5">
                  <span className="type-nav-label text-ink-muted">{tr("updated")}</span>
                  <span className="text-sm text-ink-secondary font-mono">
                    {record?.updatedAt ? new Date(record.updatedAt).toLocaleString() : "—"}
                  </span>
                </div>
              </div>
            </section>
          </div>
        )}
      </div>

      <section>
        <div className="card p-12 border-2 border-dashed border-stroke flex flex-col items-center justify-center text-ink-muted bg-canvas/50">
          <p className="text-sm italic">{tr("contentPlaceholder")}</p>
        </div>
      </section>
    </div>
  );
}
