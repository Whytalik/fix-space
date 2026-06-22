"use client";

import { useTranslations } from "next-intl";
import { Zap } from "lucide-react";
import type { AutomationActionType, AutomationTrigger } from "@fixspace/domain";

interface ActionDraft {
  type: AutomationActionType;
  propertyId: string;
  value: string;
  databaseId: string;
}

interface TemplateDraft {
  name: string;
  trigger: AutomationTrigger;
  config: Record<string, unknown>;
  actions: ActionDraft[];
}

interface TemplateItem {
  id: string;
  name: string;
  when: string;
  then: string;
  draft: TemplateDraft;
}

interface AutomationGalleryProps {
  templates: TemplateItem[];
  onApplyTemplate: (template: TemplateItem) => void;
  onStartFromScratch: () => void;
}

export function AutomationGallery({ templates, onApplyTemplate, onStartFromScratch }: AutomationGalleryProps) {
  const t = useTranslations("Automation");

  return (
    <div className="flex flex-col gap-4">
      <p className="type-hint">{t("selectTemplateHint")}</p>

      <div className="flex flex-col gap-2">
        {templates.map((template) => (
          <button
            key={template.id}
            type="button"
            onClick={() => onApplyTemplate(template)}
            className="text-left p-3 border border-stroke rounded-lg bg-surface hover:bg-canvas transition-colors duration-150"
          >
            <p className="type-form-label">{template.name}</p>
            <p className="type-hint mt-0.5">
              <span className="text-ink-secondary">{t("whenSection")}</span> {template.when} →{" "}
              <span className="text-ink-secondary">{t("thenSection")}</span> {template.then}
            </p>
          </button>
        ))}
      </div>

      <button
        type="button"
        onClick={onStartFromScratch}
        className="text-left p-3 border border-stroke border-dashed rounded-lg bg-surface hover:bg-canvas transition-colors duration-150 flex items-center gap-2"
      >
        <Zap size={14} className="text-ink-secondary" />
        <span className="type-form-label">{t("startFromScratch")}</span>
      </button>
    </div>
  );
}
