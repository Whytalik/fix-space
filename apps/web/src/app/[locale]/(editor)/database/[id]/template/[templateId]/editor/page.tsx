"use client";

import { useParams, useRouter } from "next/navigation";
import { useTemplateQuery } from "@/hooks/api/use-templates-query";
import { useUpdateTemplate } from "@/hooks/api/use-template-mutations";
import { useContentEditor } from "@/app/[locale]/(dashboard)/record/[id]/_components/content-area/lib/use-content-editor";
import { ContentEditorShell } from "@/app/[locale]/(editor)/record/[id]/editor/_components/content-editor-shell";
import { PageLoader } from "@/components/ui/primitives/feedback/page-loader";
import { IconDisplay } from "@/components/ui/icons/icon-display";
import { LayoutGrid } from "lucide-react";
import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import { normalizeContentSchema } from "@/lib/content-schema";

export default function TemplateContentEditorPage() {
  const params = useParams<{ id: string; templateId: string }>();
  const databaseId = params.id;
  const templateId = params.templateId;
  const router = useRouter();
  const t = useTranslations("RecordPage");

  const { data: template, isLoading: isTemplateLoading } = useTemplateQuery(templateId);
  const { mutateAsync: updateTemplateAsync } = useUpdateTemplate(databaseId);

  const initialContent = useMemo(() => (template ? normalizeContentSchema(template.content) : undefined), [template]);

  const editor = useContentEditor({
    initialContent,
    isLoading: isTemplateLoading,
    onSave: (content) => updateTemplateAsync({ id: templateId, data: { content } }),
  });

  const [isSavingAndLeaving, setIsSavingAndLeaving] = useState(false);

  async function handleDone() {
    setIsSavingAndLeaving(true);
    try {
      await updateTemplateAsync({ id: templateId, data: { content: editor.content } });
      router.push(`/database/${databaseId}/template/${templateId}`);
    } catch {
      setIsSavingAndLeaving(false);
    }
  }

  if (isTemplateLoading) return <PageLoader />;

  return (
    <ContentEditorShell
      editor={editor}
      hasChanges={editor.hasChanges}
      backHref={`/database/${databaseId}/template/${templateId}`}
      backAriaLabel={t("backToTemplate")}
      entityIcon={template?.icon ? <IconDisplay value={template.icon} size={18} /> : <LayoutGrid size={18} />}
      entityName={template?.name || t("untitled")}
      badgeLabel={t("templateEditor")}
      onDone={handleDone}
      isDonePending={isSavingAndLeaving}
      templateId={templateId}
      autoSwitchToStructure
    />
  );
}
