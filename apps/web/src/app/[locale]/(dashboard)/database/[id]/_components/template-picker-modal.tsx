"use client";

import { ModalShell } from "@/components/ui/overlays/modal-shell";
import { Star } from "lucide-react";
import { useTranslations } from "next-intl";
import type { TemplateResponseDto } from "@fixspace/domain";

interface TemplatePickerModalProps {
  templates: TemplateResponseDto[];
  onSelect: (templateId: string | null) => void;
  onClose: () => void;
}

export function TemplatePickerModal({ templates, onSelect, onClose }: TemplatePickerModalProps) {
  const t = useTranslations("TemplatePickerModal");

  return (
    <ModalShell isOpen={true} onClose={onClose} title={t("chooseTemplate")} size="sm">
      <div className="flex flex-col gap-1">
        {templates.map((template) => (
          <button
            key={template.id}
            onClick={() => onSelect(template.id)}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm text-ink hover:bg-canvas-subtle transition-colors duration-150 text-left"
          >
            <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-surface border border-stroke shrink-0 text-base">
              {template.icon || "📄"}
            </div>
            <span className="flex-1 truncate font-medium">{template.name}</span>
            {template.isDefault && (
              <span className="flex items-center gap-1 text-xs font-semibold text-accent uppercase tracking-wider shrink-0">
                <Star size={9} fill="currentColor" />
                {t("default")}
              </span>
            )}
          </button>
        ))}

        <div className="border-t border-stroke-subtle mt-1 pt-1">
          <button
            onClick={() => onSelect(null)}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm text-ink-secondary hover:bg-canvas-subtle transition-colors duration-150 text-left"
          >
            <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-surface border border-stroke shrink-0 text-base opacity-40">
              📄
            </div>
            <span className="flex-1 truncate">{t("noTemplate")}</span>
          </button>
        </div>
      </div>
    </ModalShell>
  );
}
