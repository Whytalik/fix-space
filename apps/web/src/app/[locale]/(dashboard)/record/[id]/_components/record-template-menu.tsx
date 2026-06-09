"use client";

import { useTemplatesQuery } from "@/hooks/api/use-templates-query";
import { useApplyTemplate } from "@/hooks/api/use-record-mutations";
import { useUIContext } from "@/context/ui-context";
import { Button } from "@/components/ui/primitives/actions/button";
import { ChevronDown, Sparkles, Star } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState, useRef, useEffect } from "react";
import { cn } from "@/utils/ui/cn";

interface RecordTemplateMenuProps {
  recordId: string;
  databaseId: string;
}

export function RecordTemplateMenu({ recordId, databaseId }: RecordTemplateMenuProps) {
  const t = useTranslations("TemplatePickerModal");
  const { data: templates = [] } = useTemplatesQuery(databaseId);
  const applyTemplateMutation = useApplyTemplate(databaseId);
  const { showError, showToast } = useUIContext();

  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function handleApply(templateId: string) {
    try {
      await applyTemplateMutation.mutateAsync({ recordId, templateId });
      showToast("Template applied successfully", "success");
      setIsOpen(false);
    } catch (error) {
      showError(error);
    }
  }

  if (templates.length === 0) return null;

  return (
    <div className="relative" ref={menuRef}>
      <Button
        variant="secondary"
        size="sm"
        className="flex items-center gap-2 h-9 rounded-lg border border-stroke-subtle hover:border-accent/30 transition-colors duration-150"
        onClick={() => setIsOpen(!isOpen)}
        loading={applyTemplateMutation.isPending}
      >
        <Sparkles size={14} className="text-accent" />
        <span className="text-xs font-medium">Apply Template</span>
        <ChevronDown size={14} className={cn("transition-transform duration-200 opacity-60", isOpen && "rotate-180")} />
      </Button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-1 w-64 bg-canvas border border-stroke rounded-2xl shadow-elevated z-50 py-1.5">
          <div className="px-3 py-1.5 mb-1 border-b border-stroke-subtle">
            <p className="text-xs font-bold text-ink-muted uppercase tracking-wider">{t("chooseTemplate")}</p>
          </div>

          <div className="max-h-64 overflow-y-auto scrollbar">
            {templates.map((template) => (
              <button
                key={template.id}
                onClick={() => handleApply(template.id)}
                className="flex items-center gap-3 w-full px-3 py-2 text-sm text-ink hover:bg-canvas-subtle transition-colors duration-150"
              >
                <div className="w-6 h-6 flex items-center justify-center rounded bg-surface border border-stroke shrink-0">
                  {template.icon || "📄"}
                </div>
                <span className="flex-1 text-left truncate">{template.name}</span>
                {template.isDefault && <Star size={10} className="text-accent shrink-0" fill="currentColor" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
