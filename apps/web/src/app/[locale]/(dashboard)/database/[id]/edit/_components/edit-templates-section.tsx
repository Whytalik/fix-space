"use client";

import { ConfirmDialog } from "@/components/ui/overlays/confirm-dialog";
import { IconDisplay } from "@/components/ui/icons/icon-display";
import { Badge } from "@/components/ui/primitives/display/badge";
import { Button } from "@/components/ui/primitives/actions/button";
import { useUIContext } from "@/context/ui-context";
import { createTemplate, deleteTemplate, getTemplates } from "@/lib/api/template";
import type { DatabaseResponseDto, TemplateResponseDto } from "@fixspace/domain";
import { Layers, Pencil, Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

type EditTemplatesSectionProps = {
  database: DatabaseResponseDto;
};

export function EditTemplatesSection({ database }: EditTemplatesSectionProps) {
  const { showError } = useUIContext();
  const router = useRouter();
  const t = useTranslations("TemplateEdit");

  const [templates, setTemplates] = useState<TemplateResponseDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [deletingTemplate, setDeletingTemplate] = useState<TemplateResponseDto | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    getTemplates(database.id)
      .then(setTemplates)
      .catch(showError)
      .finally(() => setIsLoading(false));
  }, [database.id, showError]);

  async function handleAddTemplate() {
    setIsCreating(true);
    try {
      const isFirst = templates.length === 0;
      const created = await createTemplate({
        databaseId: database.id,
        name: t("untitledTemplate"),
        isDefault: isFirst,
      });
      router.push(`/database/${database.id}/template/${created.id}`);
    } catch (err) {
      showError(err);
    } finally {
      setIsCreating(false);
    }
  }

  async function handleConfirmDelete() {
    if (!deletingTemplate) return;
    setIsDeleting(true);
    try {
      await deleteTemplate(deletingTemplate.id);
      setTemplates((prev) => prev.filter((t) => t.id !== deletingTemplate.id));
      setDeletingTemplate(null);
    } catch (err) {
      showError(err);
    } finally {
      setIsDeleting(false);
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="w-5 h-5 rounded-full border-2 border-stroke border-t-accent animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-ink-secondary">
          {templates.length === 0
            ? t("noTemplates")
            : `${templates.length} ${templates.length === 1 ? t("template") : t("templates")}`}
        </p>
        <Button variant="secondary" size="sm" onClick={handleAddTemplate} disabled={isCreating}>
          <Plus size={14} className="mr-1" />
          {isCreating ? t("creating") : t("addTemplate")}
        </Button>
      </div>

      {templates.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-14 gap-3 text-center border border-dashed border-stroke rounded-xl">
          <Layers size={28} className="text-ink-muted" />
          <p className="text-sm text-ink-muted max-w-xs">{t("templatesDesc")}</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {templates.map((template) => (
            <div
              key={template.id}
              className="flex items-center gap-3 px-4 py-3 bg-surface border border-stroke rounded-xl hover:bg-hover transition-colors duration-150"
            >
              <span className="shrink-0 text-ink-muted">
                {template.icon ? <IconDisplay value={template.icon} size={18} /> : <Layers size={18} />}
              </span>
              <span className="flex-1 min-w-0 text-sm font-medium text-ink truncate">
                {template.name || t("untitledTemplate")}
              </span>
              {template.isDefault && <Badge variant="accent">{t("default")}</Badge>}
              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() => router.push(`/database/${database.id}/template/${template.id}`)}
                  className="p-1.5 rounded-lg text-ink-muted hover:text-ink hover:bg-elevated transition-colors duration-150"
                  title={t("editTemplate")}
                >
                  <Pencil size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => setDeletingTemplate(template)}
                  className="p-1.5 rounded-lg text-ink-muted hover:text-red-500 hover:bg-red-500/10 transition-colors duration-150"
                  title={t("deleteTemplate")}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {deletingTemplate && (
        <ConfirmDialog
          title={t("deleteTemplate")}
          description={t("deleteDescription", { name: deletingTemplate.name || t("untitledTemplate") })}
          confirmLabel={isDeleting ? t("deleting") : t("delete")}
          variant="danger"
          onConfirm={handleConfirmDelete}
          onCancel={() => setDeletingTemplate(null)}
        />
      )}
    </div>
  );
}
