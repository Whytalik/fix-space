"use client";

import { Button } from "@/components/ui/primitives/actions/button";
import { useTemplatesQuery } from "@/hooks/api/use-templates-query";
import {
  useCreateTemplate,
  useDeleteTemplate,
  useDuplicateTemplate,
  useUpdateTemplate,
  useResetTemplate,
} from "@/hooks/api/use-template-mutations";
import { useUIContext } from "@/context/ui-context";
import { useDatabaseContext } from "@/context/database-context";
import { Copy, MoreHorizontal, Pencil, Plus, Star, Trash2, RotateCcw } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { useState, useRef, useEffect } from "react";
import { IconDisplay } from "@/components/ui/icons/icon-display";
import { TemplateFormModal } from "./template-form-modal";
import type { TemplateResponseDto } from "@fixspace/domain";

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

  useCreateTemplate(databaseId);
  const updateTemplateMutation = useUpdateTemplate(databaseId);
  const deleteTemplateMutation = useDeleteTemplate(databaseId);
  const duplicateTemplateMutation = useDuplicateTemplate(databaseId);
  const resetTemplateMutation = useResetTemplate(databaseId);

  const [modal, setModal] = useState<{ mode: "create" } | { mode: "edit"; template: TemplateResponseDto } | null>(null);
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpenId(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function handleSetDefault(id: string) {
    try {
      await updateTemplateMutation.mutateAsync({ id, data: { isDefault: true } });
      setMenuOpenId(null);
    } catch (error) {
      showError(error);
    }
  }

  async function handleDuplicate(id: string) {
    try {
      await duplicateTemplateMutation.mutateAsync(id);
      setMenuOpenId(null);
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
    setMenuOpenId(null);
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
    setMenuOpenId(null);
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
          onClick={() => setModal({ mode: "create" })}
          disabled={isLocked}
        >
          <Plus size={13} />
          {t("addTemplate")}
        </Button>
      </div>

      {templates.length === 0 ? (
        <div className="rounded-lg border border-dashed border-stroke flex flex-col items-center justify-center py-12 gap-3 bg-canvas/50">
          <p className="text-sm text-ink-muted">{t("noTemplates")}</p>
          <Button variant="secondary" size="sm" onClick={() => setModal({ mode: "create" })} disabled={isLocked}>
            {t("createFirst")}
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {templates.map((template) => (
            <div
              key={template.id}
              className="group relative flex items-center gap-3 p-4 bg-canvas border border-stroke rounded-2xl hover:border-accent/30 hover:shadow-sm transition-colors duration-200 cursor-pointer"
              onClick={() => router.push(`/database/${databaseId}/template/${template.id}`)}
            >
              <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-surface border border-stroke shadow-sm">
                <IconDisplay value={template.icon || "📄"} size={20} />
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

              <div className="relative flex items-center gap-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setMenuOpenId(menuOpenId === template.id ? null : template.id);
                  }}
                  className="p-1.5 rounded-lg hover:bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <MoreHorizontal size={14} />
                </button>

                {menuOpenId === template.id && (
                  <div
                    ref={menuRef}
                    className="absolute right-0 top-full mt-1 w-48 bg-canvas border border-stroke rounded-lg shadow-elevated z-50 py-1 animate-fade-up"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      onClick={() => {
                        setModal({ mode: "edit", template });
                        setMenuOpenId(null);
                      }}
                      className="flex items-center gap-2 w-full px-3 py-2 text-sm text-ink hover:bg-canvas-subtle transition-colors duration-150"
                    >
                      <Pencil size={14} className="text-ink-muted" />
                      {t("editMeta")}
                    </button>
                    <button
                      onClick={() => handleDuplicate(template.id)}
                      className="flex items-center gap-2 w-full px-3 py-2 text-sm text-ink hover:bg-canvas-subtle transition-colors duration-150"
                    >
                      <Copy size={14} className="text-ink-muted" />
                      {t("duplicate")}
                    </button>
                    <button
                      onClick={() => handleReset(template.id)}
                      className="flex items-center gap-2 w-full px-3 py-2 text-sm text-ink hover:bg-canvas-subtle transition-colors duration-150"
                    >
                      <RotateCcw size={14} className="text-ink-muted" />
                      {t("reset")}
                    </button>
                    {!template.isDefault && (
                      <button
                        onClick={() => handleSetDefault(template.id)}
                        className="flex items-center gap-2 w-full px-3 py-2 text-sm text-ink hover:bg-canvas-subtle transition-colors duration-150"
                      >
                        <Star size={14} className="text-ink-muted" />
                        {t("setDefault")}
                      </button>
                    )}
                    <div className="h-px bg-stroke my-1" />
                    <button
                      onClick={() => handleDelete(template.id)}
                      className="flex items-center gap-2 w-full px-3 py-2 text-sm text-error hover:bg-error/5 transition-colors duration-150"
                    >
                      <Trash2 size={14} />
                      {t("delete")}
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {modal && (
        <TemplateFormModal
          mode={modal.mode}
          template={modal.mode === "edit" ? modal.template : undefined}
          databaseId={databaseId}
          onClose={() => setModal(null)}
        />
      )}
    </section>
  );
}
