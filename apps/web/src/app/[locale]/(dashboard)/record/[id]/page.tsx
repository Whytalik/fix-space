"use client";

import { useParams } from "next/navigation";
import { useRecordQuery } from "@/hooks/api/use-record-query";
import { usePropertiesQuery } from "@/hooks/api/use-properties-query";
import { PageLoader } from "@/components/ui/primitives/feedback/page-loader";
import { useAppContext } from "@/context/app-context";
import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { updateRecord } from "@/lib/api/record";
import { getPropertyGroups } from "@/lib/api/property-group";
import { queryKeys } from "@/lib/api/query-keys";
import { PropertyList } from "@/components/database/property-list";
import { RecordTemplateMenu } from "./_components/record-template-menu";
import { useTranslations } from "next-intl";
import { FileText, PenLine } from "lucide-react";
import { IconDisplay } from "@/components/ui/icons/icon-display";
import { DatabaseProvider } from "@/context/database-context";
import { ContentArea } from "./_components/content-area";
import { useContentEditor } from "./_components/content-area/lib/use-content-editor";
import { useRecordContentQuery } from "@/hooks/api/use-record-content-query";
import { useRecordContentMutations } from "@/hooks/api/use-record-content-mutations";
import { Link } from "@/i18n/navigation";

export default function RecordPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const { data: record, isLoading: isRecordLoading } = useRecordQuery(id);
  const { setCurrentDatabaseId } = useAppContext();
  const queryClient = useQueryClient();
  const t = useTranslations("RecordPage");
  const [titleValue, setTitleValue] = useState("");
  const [isEditingTitle, setIsEditingTitle] = useState(false);

  const { data: properties = [], isLoading: isPropertiesLoading } = usePropertiesQuery(record?.databaseId || "", {
    enabled: !!record?.databaseId,
  });

  const { data: propertyGroups = [] } = useQuery({
    queryKey: queryKeys.propertyGroups.all(record?.databaseId ?? ""),
    queryFn: () => getPropertyGroups(record!.databaseId),
    enabled: !!record?.databaseId,
  });

  const { data: serverContent, isLoading: isContentLoading } = useRecordContentQuery(id);
  const { updateMutation: updateContentMutation } = useRecordContentMutations(id);
  const contentEditor = useContentEditor({
    initialContent: serverContent?.content,
    isLoading: isContentLoading,
    onSave: (content) => updateContentMutation.mutate({ content }),
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
      titleMutation.mutate(trimmed || t("untitled"));
    }
  }

  const isLoading = isRecordLoading || (isPropertiesLoading && !!record?.databaseId);

  if (isLoading) return <PageLoader />;

  return (
    <div className="flex-1 overflow-y-auto scrollbar animate-fade-up px-8 py-10">
      <div className="mb-8 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <span className="text-ink-muted shrink-0">
            {record?.icon ? <IconDisplay value={record.icon} size={28} /> : <FileText size={28} />}
          </span>
          <input
            type="text"
            className="type-page-title bg-transparent border-0 outline-none p-0 min-w-0 w-full placeholder:text-ink-muted"
            value={titleValue}
            placeholder={t("untitled")}
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
          {record && <RecordTemplateMenu recordId={record.id} databaseId={record.databaseId} currentContent={contentEditor.content} />}
        </div>
      </div>

      <div className="grid gap-8 mb-8 grid-cols-1 lg:grid-cols-4">
        <div className="lg:col-span-3 space-y-8">
          <section>
            <div className="card p-4">
              <DatabaseProvider databaseId={record?.databaseId} skipStateUpdate={true}>
                <PropertyList properties={properties} entity={record!} mode="record" propertyGroups={propertyGroups} />
              </DatabaseProvider>
            </div>
          </section>
        </div>

        <div className="space-y-8">
          <section>
            <div className="card p-6 space-y-5">
              <div className="flex flex-col gap-1.5">
                <span className="type-nav-label text-ink-muted">{t("created")}</span>
                <span className="text-sm text-ink-secondary font-mono">
                  {record?.createdAt ? new Date(record.createdAt).toLocaleString() : "—"}
                </span>
              </div>
              <div className="flex flex-col gap-1.5">
                <span className="type-nav-label text-ink-muted">{t("updated")}</span>
                <span className="text-sm text-ink-secondary font-mono">
                  {record?.updatedAt ? new Date(record.updatedAt).toLocaleString() : "—"}
                </span>
              </div>
            </div>
          </section>
        </div>
      </div>

      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="type-nav-label text-ink-muted">{t("content")}</h2>
          <Link
            href={`/record/${id}/editor`}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-stroke text-ink-secondary hover:text-ink hover:bg-surface-hover transition-colors duration-150"
          >
            <PenLine size={13} />
            {t("editLayout")}
          </Link>
        </div>
        <ContentArea editor={contentEditor} mode="view" recordId={id} />
      </section>
    </div>
  );
}
