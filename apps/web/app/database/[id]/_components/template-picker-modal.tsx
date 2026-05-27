"use client";

import { IconDisplay } from "@/components/ui/icons/icon-display";
import { Badge } from "@/components/ui/primitives/badge";
import type { TemplateResponseDto } from "@fixspace/domain";
import { FileX, Layers } from "lucide-react";

type TemplatePickerModalProps = {
  templates: TemplateResponseDto[];
  onSelect: (templateId: string | null) => void;
  onClose: () => void;
};

export function TemplatePickerModal({ templates, onSelect, onClose }: TemplatePickerModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-elevated border border-stroke rounded-xl shadow-xl w-full max-w-sm mx-4 overflow-hidden">
        <div className="px-5 py-4 border-b border-stroke">
          <h2 className="type-panel-title">Choose a template</h2>
          <p className="text-sm text-ink-muted mt-0.5">Select a template to apply to the new record.</p>
        </div>
        <div className="divide-y divide-stroke max-h-80 overflow-y-auto">
          <button
            type="button"
            onClick={() => onSelect(null)}
            className="w-full flex items-center gap-3 px-5 py-3 text-left hover:bg-surface transition-colors"
          >
            <FileX size={18} className="text-ink-muted shrink-0" />
            <span className="text-sm text-ink">No template</span>
          </button>
          {templates.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => onSelect(t.id)}
              className="w-full flex items-center gap-3 px-5 py-3 text-left hover:bg-surface transition-colors"
            >
              {t.icon ? <IconDisplay value={t.icon} size={18} /> : <Layers size={18} className="text-ink-muted" />}
              <span className="flex-1 text-sm text-ink">{t.name}</span>
              {t.isDefault && <Badge variant="neutral">Default</Badge>}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
