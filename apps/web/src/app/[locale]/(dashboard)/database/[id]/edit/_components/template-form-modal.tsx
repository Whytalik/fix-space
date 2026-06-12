"use client";

import { ModalShell } from "@/components/ui/overlays/modal-shell";
import { Button } from "@/components/ui/primitives/actions/button";
import { useDatabaseContext } from "@/context/database-context";
import { useUIContext } from "@/context/ui-context";
import { useCreateTemplate, useUpdateTemplate } from "@/hooks/api/use-template-mutations";
import { parseApiError } from "@/lib/api/client";
import type { TemplateResponseDto } from "@fixspace/domain";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { IconDisplay } from "@/components/ui/icons/icon-display";
import { IconPicker } from "@/components/ui/icons/icon-picker";
import { useRef } from "react";

interface TemplateFormModalProps {
  mode: "create" | "edit";
  template?: TemplateResponseDto;
  databaseId: string;
  onClose: () => void;
}

export function TemplateFormModal({ mode, template, databaseId, onClose }: TemplateFormModalProps) {
  const t = useTranslations("TemplateEdit");
  const { showError } = useUIContext();
  const { invalidateTemplates } = useDatabaseContext();

  const createMutation = useCreateTemplate(databaseId);
  const updateMutation = useUpdateTemplate(databaseId);

  const [name, setName] = useState(template?.name ?? "");
  const [description, setDescription] = useState(template?.description ?? "");
  const [icon, setIcon] = useState(template?.icon ?? "icon:LayoutTemplate");
  const [showIconPicker, setShowIconPicker] = useState(false);
  const iconButtonRef = useRef<HTMLButtonElement>(null);

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      if (mode === "create") {
        await createMutation.mutateAsync({
          name: name.trim(),
          description: description.trim(),
          icon,
        });
      } else if (template) {
        await updateMutation.mutateAsync({
          id: template.id,
          data: {
            name: name.trim(),
            description: description.trim(),
            icon,
          },
        });
      }
      invalidateTemplates();
      onClose();
    } catch (err) {
      showError(parseApiError(err));
    }
  }

  return (
    <ModalShell isOpen onClose={onClose} title={mode === "create" ? t("createTitle") : t("editTitle")} size="md">
      <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-5">
        <div className="flex items-start gap-4">
          <div className="shrink-0">
            <button
              ref={iconButtonRef}
              type="button"
              onClick={() => setShowIconPicker(!showIconPicker)}
              className="flex items-center justify-center w-10 h-10 rounded-lg border border-stroke bg-canvas hover:border-accent transition-colors duration-150 cursor-pointer"
            >
              <IconDisplay value={icon} size={20} />
            </button>
            {showIconPicker && (
              <IconPicker
                value={icon}
                onChange={(val) => {
                  setIcon(val);
                  setShowIconPicker(false);
                }}
                onClose={() => setShowIconPicker(false)}
                anchorEl={iconButtonRef.current}
              />
            )}
          </div>

          <div className="flex-1">
            <input
              autoFocus
              className="field-input text-lg font-bold"
              placeholder={t("namePlaceholder")}
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
        </div>

        <div>
          <label className="block mb-1.5 type-field-label">{t("descriptionLabel")}</label>
          <textarea
            className="field-input min-h-[80px] py-2 resize-none"
            placeholder={t("descriptionPlaceholder")}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <p className="mt-2 type-hint leading-relaxed opacity-60 italic">
            Tokens supported: {"{{today}}"}, {"{{day}}"}, {"{{month}}"}, {"{{count}}"}
          </p>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button variant="secondary" onClick={onClose} type="button">
            {t("cancel")}
          </Button>
          <Button variant="primary" type="submit" loading={isSubmitting}>
            {mode === "create" ? t("create") : t("save")}
          </Button>
        </div>
      </form>
    </ModalShell>
  );
}
