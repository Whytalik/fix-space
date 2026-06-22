"use client";

import { Button } from "@/components/ui/primitives/actions/button";
import { useTemplatesQuery } from "@/hooks/api/use-templates-query";
import { useCreateTemplate, useDeleteTemplate, useDuplicateTemplate, useResetTemplate } from "@/hooks/api/use-template-mutations";
import { useUIContext } from "@/context/ui-context";
import { useDatabaseContext } from "@/context/database-context";
import { Copy, Plus, Star, Trash2, RotateCcw } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { IconDisplay } from "@/components/ui/icons/icon-display";

interface EditTemplatesSectionProps {
  databaseId: string;
  isLocked?: boolean;
}

export function EditTemplatesSection({ databaseId, isLocked }: EditTemplatesSectionProps) {
  const t = useTranslations("TemplateEdit");
  const router = useRouter();
  const { data: templates = [], isLoading } = useTemplatesQuery(databaseId);
  const { showConfirm, showError } = useUIContext();
  const { views } = useDatabaseContext();

  const createTemplateMutation = useCreateTemplate(databaseId);
  const deleteTemplateMutation = useDeleteTemplate(databaseId);
  const duplicateTemplateMutation = useDuplicateTemplate(databaseId);
  const resetTemplateMutation = useResetTemplate(databaseId);

  async function handleCreate() {
    try {
      const newTemplate = await createTemplateMutation.mutateAsync({ name: t("createTitle") });
      router.push(`/database/${databaseId}/template/${newTemplate.id}`);
    } catch (error) {
      showError(error);
    }
  }

  async function handleDuplicate(id: string) {
    try {
      await duplicateTemplateMutation.mutateAsync(id);
    } catch (error) {
      showError(error);
    }
  }

  async function handleReset(id: string) {
    showConfirm({
      title: t("resetTemplate"),
      message: t("resetTemplateDesc"),
      onConfirm: async () => {
        try {
          await resetTemplateMutation.mutateAsync(id);
        } catch (error) {
          showError(error);
        }
      },
    });
  }

  async function handleDelete(id: string) {
    showConfirm({
      title: t("deleteTemplate"),
      message: t("deleteTemplateDesc"),
      onConfirm: async () => {
        try {
          await deleteTemplateMutation.mutateAsync(id);
        } catch (error) {
          showError(error);
        }
      },
    });
  }

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-16 bg-surface border border-stroke rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h2 className="type-panel-title">
          {t("title")}
          <span className="ml-2 text-ink-muted font-normal text-sm">({templates.length})</span>
        </h2>
        <Button
          variant="secondary"
          size="sm"
          className="flex items-center gap-1.5"
          onClick={handleCreate}
          disabled={isLocked || createTemplateMutation.isPending}
        >
          <Plus size={13} />
          {t("addTemplate")}
        </Button>
      </div>

      {templates.length === 0 ? (
        <div className="rounded-lg border border-dashed border-stroke flex flex-col items-center justify-center py-12 gap-3 bg-canvas/50">
          <p className="text-sm text-ink-muted">{t("noTemplates")}</p>
          <Button variant="secondary" size="sm" onClick={handleCreate} disabled={isLocked || createTemplateMutation.isPending}>
            {t("createFirst")}
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {templates.map((template) => (
            <div
              key={template.id}
              className="group relative flex items-center gap-3 p-4 bg-canvas border border-stroke rounded-2xl hover:border-accent/30 hover:shadow-sm transition-colors duration-150 cursor-pointer"
              onClick={() => router.push(`/database/${databaseId}/template/${template.id}`)}
            >
              <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-surface border border-stroke shadow-sm">
                <IconDisplay value={template.icon || "icon:LayoutTemplate"} size={20} />
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-ink truncate">{template.name}</h3>
                {template.description && <p className="text-xs text-ink-muted truncate mt-0.5">{template.description}</p>}
                {(() => {
                  const viewsUsingTemplate = views.filter((view) => view.useDefaultTemplate && view.defaultTemplateId === template.id);
                  if (viewsUsingTemplate.length === 0) return null;
                  return (
                    <div className="flex flex-wrap items-center gap-1 mt-1.5">
                      <span className="text-xs text-ink-muted">{t("defaultForView")}</span>
                      {viewsUsingTemplate.map((view) => (
                        <span
                          key={view.id}
                          className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-accent/10 text-accent text-xs font-semibold"
                        >
                          <Star size={8} fill="currentColor" />
                          {view.name}
                        </span>
                      ))}
                    </div>
                  );
                })()}
              </div>

              <div className="flex items-center gap-1 transition-opacity">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDuplicate(template.id);
                  }}
                  className="p-2 rounded-lg text-ink-muted hover:text-ink hover:bg-surface-hover transition-colors duration-150"
                  title={t("duplicate")}
                >
                  <Copy size={14} />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleReset(template.id);
                  }}
                  className="p-2 rounded-lg text-ink-muted hover:text-ink hover:bg-surface-hover transition-colors duration-150"
                  title={t("reset")}
                >
                  <RotateCcw size={14} />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(template.id);
                  }}
                  className="p-2 rounded-lg text-ink-muted hover:text-error hover:bg-error/5 transition-colors duration-150"
                  title={t("delete")}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
