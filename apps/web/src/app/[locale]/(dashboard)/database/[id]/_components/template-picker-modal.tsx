"use client";

import { ModalShell } from "@/components/ui/overlays/modal-shell";
import { Star, FileText } from "lucide-react";
import { useTranslations } from "next-intl";
import type { TemplateResponseDto } from "@fixspace/domain";
import { IconDisplay } from "@/components/ui/icons/icon-display";

interface TemplatePickerModalProps {
  templates: TemplateResponseDto[];
  onSelect: (templateId: string | null) => void;
  onClose: () => void;
}

export function TemplatePickerModal({ templates, onSelect, onClose }: TemplatePickerModalProps) {
  const t = useTranslations("TemplatePickerModal");

  return (
    <ModalShell isOpen={true} onClose={onClose} title={t("chooseTemplate")} size="sm">
      <div className="flex flex-col gap-1 p-2">
        {templates.map((template) => (
          <button
            key={template.id}
            onClick={() => onSelect(template.id)}
            className="group flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm text-ink hover:bg-surface-hover transition-all duration-150 text-left cursor-pointer active:scale-[0.98]"
          >
            <div className="w-9 h-9 flex items-center justify-center rounded-lg bg-surface border border-stroke shrink-0 shadow-sm group-hover:border-accent/30 transition-colors duration-150">
              <IconDisplay value={template.icon || "icon:LayoutTemplate"} size={18} />
            </div>
            <div className="flex-1 min-w-0">
              <span className="block truncate font-semibold">{template.name}</span>
              {template.description && <p className="type-hint truncate">{template.description}</p>}
            </div>
            {template.isDefault && (
              <span className="flex items-center gap-1 text-xs font-bold text-accent uppercase tracking-widest shrink-0 bg-accent/5 px-1.5 py-0.5 rounded border border-accent/20">
                <Star size={8} fill="currentColor" />
                {t("default")}
              </span>
            )}
          </button>
        ))}

        <div className="border-t border-stroke-subtle mt-2 pt-2">
          <button
            onClick={() => onSelect(null)}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm text-ink-secondary hover:bg-surface-hover transition-all duration-150 text-left cursor-pointer active:scale-[0.98]"
          >
            <div className="w-9 h-9 flex items-center justify-center rounded-lg bg-surface border border-stroke shrink-0 opacity-40">
              <FileText size={18} />
            </div>
            <span className="flex-1 truncate font-medium">{t("noTemplate")}</span>
          </button>
        </div>
      </div>
    </ModalShell>
  );
}
