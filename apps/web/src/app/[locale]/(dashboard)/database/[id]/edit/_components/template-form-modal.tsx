"use client";

import { ModalShell } from "@/components/ui/overlays/modal-shell";
import { TextInput } from "@/components/ui/primitives/inputs/text-input";
import { Button } from "@/components/ui/primitives/actions/button";
import { IconPicker } from "@/components/ui/icons/icon-picker";
import { CheckboxInput } from "@/components/ui/primitives/inputs/checkbox-input";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { useCreateTemplate, useUpdateTemplate } from "@/hooks/api/use-template-mutations";
import { useUIContext } from "@/context/ui-context";
import type { TemplateResponseDto } from "@fixspace/domain";

interface TemplateFormModalProps {
  mode: "create" | "edit";
  template?: TemplateResponseDto;
  databaseId: string;
  onClose: () => void;
}

export function TemplateFormModal({ mode, template, databaseId, onClose }: TemplateFormModalProps) {
  const t = useTranslations("TemplateEdit");
  const { showError } = useUIContext();
  const createMutation = useCreateTemplate(databaseId);
  const updateMutation = useUpdateTemplate(databaseId);

  const [name, setName] = useState(template?.name ?? "");
  const [description, setDescription] = useState(template?.description ?? "");
  const [icon, setIcon] = useState(template?.icon ?? "📄");
  const [namePattern, setNamePattern] = useState(template?.namePattern ?? "");
  const [isDefault, setIsDefault] = useState(template?.isDefault ?? false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSave() {
    if (!name.trim()) return;
    try {
      setIsSubmitting(true);
      if (mode === "create") {
        await createMutation.mutateAsync({
          databaseId,
          name,
          description,
          icon,
          namePattern,
          isDefault,
        });
      } else if (template) {
        await updateMutation.mutateAsync({
          id: template.id,
          data: {
            name,
            description,
            icon,
            namePattern,
            isDefault,
          },
        });
      }
      onClose();
    } catch (error) {
      showError(error);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <ModalShell isOpen={true} onClose={onClose} title={mode === "create" ? t("createTitle") : t("editTitle")} size="sm">
      <div className="flex flex-col gap-5 p-6">
        <div className="flex justify-center mb-2">
          <div className="relative">
            <div className="w-16 h-16 flex items-center justify-center rounded-2xl bg-surface border border-stroke shadow-sm text-2xl">
              {icon}
            </div>
            <div className="absolute -bottom-1 -right-1">
              <IconPicker value={icon} onChange={setIcon} onClose={() => {}} />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="type-field-label">{t("nameLabel")}</label>
            <TextInput value={name} onChange={setName} placeholder={t("namePlaceholder")} />
          </div>

          <div className="space-y-1.5">
            <label className="type-field-label">{t("descriptionLabel")}</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t("descriptionPlaceholder")}
              className="field-input min-h-24 resize-none py-2"
            />
          </div>

          <div className="space-y-1.5 pt-2">
            <label className="type-field-label">{t("namePatternLabel")}</label>
            <TextInput value={namePattern} onChange={setNamePattern} placeholder={t("namePatternPlaceholder")} />
            <div className="rounded-lg bg-surface border border-stroke p-2.5 mt-1.5">
              <p className="text-xs font-bold text-ink-muted uppercase tracking-widest mb-1.5">{t("tokensTitle")}</p>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                <span className="text-xs text-ink-secondary font-mono">{"{{today}}"}</span>
                <span className="text-xs text-ink-muted italic">12.05.2026</span>
                <span className="text-xs text-ink-secondary font-mono">{"{{year}}"}</span>
                <span className="text-xs text-ink-muted italic">2026</span>
                <span className="text-xs text-ink-secondary font-mono">{"{{count}}"}</span>
                <span className="text-xs text-ink-muted italic">Total + 1</span>
              </div>
              <p className="text-xs text-ink-muted mt-2 border-t border-stroke-subtle pt-1.5">
                Use <code className="bg-canvas px-1 rounded">{"{{count:Prop=Value}}"}</code> for filtered counters.
              </p>
            </div>
          </div>

          <div className="pt-2">
            <CheckboxInput label={t("setDefaultLabel")} checked={isDefault} onChange={setIsDefault} />
            <p className="text-xs text-ink-muted mt-1 ml-6 italic">{t("setDefaultHint")}</p>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-4">
          <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>
            {t("cancel")}
          </Button>
          <Button onClick={handleSave} loading={isSubmitting} disabled={!name.trim() || isSubmitting}>
            {mode === "create" ? t("create") : t("save")}
          </Button>
        </div>
      </div>
    </ModalShell>
  );
}
