"use client";

import { useDatabaseContext } from "@/context/database-context";
import { useTemplateQuery } from "@/hooks/api/use-templates-query";
import { useUpdateTemplate } from "@/hooks/api/use-template-mutations";
import { useUpdateTemplateValue } from "@/hooks/api/use-template-value-mutations";
import { PageLoader } from "@/components/ui/primitives/feedback/page-loader";
import { IconDisplay } from "@/components/ui/icons/icon-display";
import { Button } from "@/components/ui/primitives/actions/button";
import { useRouter } from "@/i18n/navigation";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { ArrowLeft, Star } from "lucide-react";
import { useState, useEffect } from "react";
import { CellValue } from "../../_components/cell-value";
import { PropertyIcon } from "../../_components/properties/ui/property-icon";
import type { PropertyType } from "@fixspace/domain/enums";
import { useUIContext } from "@/context/ui-context";
import { parseApiError } from "@/lib/api/client";

export default function TemplateEditorPage() {
  const params = useParams<{ id: string; templateId: string }>();
  const databaseId = params.id;
  const templateId = params.templateId;
  const router = useRouter();
  const t = useTranslations("TemplateEdit");
  const { properties, isLoading: isDbContextLoading } = useDatabaseContext();

  const { data: template, isLoading: isTemplateLoading } = useTemplateQuery(templateId);
  const updateTemplateMutation = useUpdateTemplate(databaseId);
  const updateValueMutation = useUpdateTemplateValue(templateId);
  const { showToast } = useUIContext();

  const [localValues, setLocalValues] = useState<Record<string, { id: string; value: unknown }>>({});
  const [namePattern, setNamePattern] = useState("");

  useEffect(() => {
    if (template) {
      setNamePattern(template.namePattern ?? "");
      if (template.values) {
        const valueMap: Record<string, { id: string; value: unknown }> = {};
        template.values.forEach((v) => {
          valueMap[v.propertyId] = { id: v.id, value: v.value };
        });
        setLocalValues(valueMap);
      }
    }
  }, [template]);

  if (isTemplateLoading || isDbContextLoading) {
    return <PageLoader />;
  }

  if (!template) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-4">
        <p className="text-ink-muted">Template not found</p>
        <Button onClick={() => router.back()}>Go Back</Button>
      </div>
    );
  }

  async function handleUpdateValue(propertyId: string, valueId: string, newValue: unknown) {
    const current = localValues[propertyId];
    if (!current) return;

    setLocalValues((prev) => ({
      ...prev,
      [propertyId]: { ...current, value: newValue },
    }));

    try {
      await updateValueMutation.mutateAsync({
        id: valueId,
        data: { value: newValue },
      });
    } catch (error) {
      showToast(parseApiError(error), "error");
    }
  }

  async function handleUpdateNamePattern(value: string) {
    setNamePattern(value);
    try {
      await updateTemplateMutation.mutateAsync({ id: templateId, data: { namePattern: value } });
    } catch (error) {
      showToast(parseApiError(error), "error");
    }
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-canvas animate-fade-up">
      <header className="flex items-center justify-between px-6 h-16 border-b border-stroke shrink-0">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 -ml-2 rounded-full hover:bg-canvas-subtle transition-colors duration-150 text-ink-muted hover:text-ink"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-surface border border-stroke text-lg text-ink">
              <IconDisplay value={template.icon || "📄"} size={18} />
            </div>
            <div>
              <h1 className="text-sm font-bold text-ink leading-tight">{template.name}</h1>
              <p className="text-xs text-ink-muted uppercase tracking-wider font-semibold">{t("template")}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {template.isDefault && (
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-accent/10 text-accent text-xs font-bold uppercase tracking-wider mr-2">
              <Star size={10} fill="currentColor" />
              {t("defaultLabel")}
            </span>
          )}
          <Button variant="secondary" size="sm" onClick={() => router.back()}>
            Done
          </Button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-6 py-8">
        <div className="max-w-3xl mx-auto">
          <div className="mb-10">
            <h2 className="text-xs font-bold text-ink-muted uppercase tracking-widest mb-4">Record Name Pattern</h2>
            <div className="card p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="type-field-label">Pattern</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={namePattern}
                    onChange={(e) => handleUpdateNamePattern(e.target.value)}
                    placeholder="e.g. {{today}} - {{count}}"
                    className="field-input flex-1"
                  />
                </div>
                <p className="text-xs text-ink-muted italic">
                  Tokens like <code className="bg-surface px-1 rounded">{"{{today}}"}</code>,
                  <code className="bg-surface px-1 rounded">{"{{year}}"}</code>,
                  <code className="bg-surface px-1 rounded">{"{{count}}"}</code> will be replaced on record creation.
                </p>
              </div>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-xs font-bold text-ink-muted uppercase tracking-widest mb-4">Default Field Values</h2>
            <div className="bg-canvas border border-stroke rounded-2xl overflow-hidden divide-y divide-stroke-subtle">
              {properties.map((property) => {
                const valueData = localValues[property.id];
                if (!valueData) return null;

                return (
                  <div key={property.id} className="group flex items-start gap-4 p-4 hover:bg-canvas-subtle transition-colors duration-150">
                    <div className="flex items-center gap-3 w-40 shrink-0 pt-1">
                      <PropertyIcon type={property.type as PropertyType} size={14} className="text-ink-muted" />
                      <span className="text-xs font-medium text-ink-secondary truncate">{property.name}</span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <CellValue
                        type={property.type as PropertyType}
                        config={property.config}
                        value={valueData.value}
                        readOnly={false}
                        onChange={(value: unknown) => handleUpdateValue(property.id, valueData.id, value)}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-2xl bg-surface/50 border border-stroke p-4 border-dashed text-center">
            <p className="text-xs text-ink-muted italic">
              These values will be automatically filled when you create a new record using this template. Fields left empty in the template
              will remain empty in the new record.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
