"use client";

import { useParams, useRouter } from "next/navigation";
import { useRecordQuery } from "@/hooks/api/use-record-query";
import { useRecordContentQuery } from "@/hooks/api/use-record-content-query";
import { useRecordContentMutations } from "@/hooks/api/use-record-content-mutations";
import { useContentEditor } from "@/app/[locale]/(dashboard)/record/[id]/_components/content-area/lib/use-content-editor";
import { ContentEditorShell } from "./_components/content-editor-shell";
import { PageLoader } from "@/components/ui/primitives/feedback/page-loader";
import { IconDisplay } from "@/components/ui/icons/icon-display";
import { FileText } from "lucide-react";
import { useState } from "react";
import { useTranslations } from "next-intl";

export default function ContentEditorPage() {
  const params = useParams<{ id: string }>();
  const recordId = params.id;
  const router = useRouter();
  const t = useTranslations("RecordPage");

  const { data: record, isLoading: isRecordLoading } = useRecordQuery(recordId);
  const { data: serverContent, isLoading: isContentLoading } = useRecordContentQuery(recordId);
  const { updateMutation } = useRecordContentMutations(recordId);

  const editor = useContentEditor({
    initialContent: serverContent?.content,
    isLoading: isContentLoading,
    onSave: (content) => updateMutation.mutateAsync({ content }),
  });

  const [isSavingAndLeaving, setIsSavingAndLeaving] = useState(false);

  async function handleDone() {
    setIsSavingAndLeaving(true);
    try {
      await updateMutation.mutateAsync({ content: editor.content, forceSnapshot: true });
      router.push(`/record/${recordId}`);
    } catch {
      setIsSavingAndLeaving(false);
    }
  }

  if (isRecordLoading || isContentLoading) return <PageLoader />;

  return (
    <ContentEditorShell
      editor={editor}
      hasChanges={editor.hasChanges}
      backHref={`/record/${recordId}`}
      backAriaLabel={t("backToRecord")}
      entityIcon={record?.icon ? <IconDisplay value={record.icon} size={18} /> : <FileText size={18} />}
      entityName={record?.name || t("untitled")}
      badgeLabel={t("contentEditor")}
      onDone={handleDone}
      isDonePending={isSavingAndLeaving}
      recordId={recordId}
    />
  );
}
