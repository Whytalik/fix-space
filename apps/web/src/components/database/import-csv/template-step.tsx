"use client";

import { useTranslations } from "next-intl";
import { ChevronLeft } from "lucide-react";
import type { TemplateResponseDto } from "@fixspace/domain";
import { Button } from "@/components/ui/primitives/actions/button";

interface TemplateStepProps {
  templates: TemplateResponseDto[];
  selectedTemplateId: string | null;
  onSelect: (id: string | null) => void;
  onBack: () => void;
  onConfirm: () => void;
  isLoading: boolean;
  error: string | null;
}

export function TemplateStep({ templates, selectedTemplateId, onSelect, onBack, onConfirm, isLoading, error }: TemplateStepProps) {
  const t = useTranslations("ImportCsvModal");

  return (
    <div className="flex flex-col gap-5">
      <p className="type-hint text-ink-secondary">{t("templateHint")}</p>

      <div className="flex flex-col gap-2 rounded-xl border border-stroke overflow-hidden">
        <label className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-elevated transition-colors duration-150 border-b border-stroke">
          <input
            type="radio"
            name="template"
            value=""
            checked={selectedTemplateId === null}
            onChange={() => onSelect(null)}
            className="accent-accent"
          />
          <span className="type-form-label text-ink-secondary">{t("noTemplate")}</span>
        </label>

        {templates.length === 0 ? (
          <p className="px-4 py-3 type-hint text-ink-muted">{t("noTemplates")}</p>
        ) : (
          templates.map((template) => (
            <label
              key={template.id}
              className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-elevated transition-colors duration-150 border-b border-stroke last:border-0"
            >
              <input
                type="radio"
                name="template"
                value={template.id}
                checked={selectedTemplateId === template.id}
                onChange={() => onSelect(template.id)}
                className="accent-accent"
              />
              <div className="flex flex-col min-w-0">
                <span className="type-form-label text-ink">{template.name}</span>
                {template.description && <span className="type-hint text-ink-muted truncate">{template.description}</span>}
              </div>
            </label>
          ))
        )}
      </div>

      {error && <p className="type-hint text-error">{error}</p>}

      <div className="flex justify-between">
        <Button variant="secondary" leftIcon={<ChevronLeft size={14} />} onClick={onBack}>
          {t("back")}
        </Button>
        <Button variant="primary" loading={isLoading} onClick={onConfirm}>
          {t("import")}
        </Button>
      </div>
    </div>
  );
}
