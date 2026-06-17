"use client";

import { PropertyType } from "@fixspace/domain";
import type { PropertyResponseDto } from "@fixspace/domain";
import { PropertyIcon } from "@/app/[locale]/(dashboard)/database/[id]/_components/properties/ui/property-icon";
import { PropertyHint } from "@/app/[locale]/(dashboard)/database/[id]/_components/properties/ui/property-hint";
import { Link2 } from "lucide-react";
import { CellValue } from "@/app/[locale]/(dashboard)/database/[id]/_components/cell-value";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { createPropertyValue, updatePropertyValue } from "@/lib/api/property-value";
import { updateRecord } from "@/lib/api/record";
import { createTemplatePropertyValue, updateTemplatePropertyValue } from "@/lib/api/template-property-value";
import { queryKeys } from "@/lib/api/query-keys";

interface PropertyRowProps {
  entityId: string;
  mode: "record" | "template";
  property: PropertyResponseDto;
  value: unknown;
  valueId?: string;
}

export function PropertyRow({ entityId, mode, property, value, valueId }: PropertyRowProps) {
  const tRecord = useTranslations("RecordPage");
  const tTemplate = useTranslations("TemplateEdit");
  const t = mode === "record" ? tRecord : tTemplate;
  const isNumeric = property.type === PropertyType.NUMBER;
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (newValue: unknown) => {
      const isPrimary = property.position === 0 && property.type === PropertyType.TEXT;

      if (mode === "record") {
        if (isPrimary) {
          return updateRecord(entityId, { name: newValue as string });
        }

        if (valueId) {
          return updatePropertyValue(entityId, valueId, { value: newValue });
        } else {
          return createPropertyValue(entityId, { propertyId: property.id, value: newValue });
        }
      } else {
        if (valueId) {
          return updateTemplatePropertyValue(valueId, { value: newValue });
        } else {
          return createTemplatePropertyValue({
            templateId: entityId,
            propertyId: property.id,
            value: newValue,
          });
        }
      }
    },
    onSuccess: () => {
      if (mode === "record") {
        queryClient.invalidateQueries({ queryKey: ["records", "detail", entityId] });
        queryClient.invalidateQueries({ queryKey: queryKeys.records.all(property.databaseId) });
      } else {
        queryClient.invalidateQueries({ queryKey: queryKeys.templates.values(entityId) });
        queryClient.invalidateQueries({ queryKey: queryKeys.templates.detail(entityId) });
      }
    },
  });

  return (
    <div className="flex items-stretch py-1.5 border-b border-stroke-subtle last:border-0 hover:bg-hover transition-colors duration-150 px-5 rounded-lg group">
      <div className="w-44 shrink-0 flex items-center gap-2 pr-3">
        <span className="text-ink-muted group-hover:text-accent transition-colors duration-150 shrink-0">
          <PropertyIcon type={property.type} size={14} />
        </span>
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="text-sm text-ink-secondary truncate">{property.name}</span>
          {property.integrationKey && (
            <span title={t("automatedByIntegration")} className="flex items-center">
              <Link2 size={12} className="text-accent shrink-0" />
            </span>
          )}
          {property.hint && <PropertyHint hint={property.hint} />}
        </div>
      </div>

      <div className="w-px bg-stroke-subtle shrink-0" />

      <div className={`flex-1 flex items-center pl-3 min-w-0 ${isNumeric ? "font-mono" : ""}`}>
        <CellValue
          value={value}
          type={property.type}
          config={property.config}
          readOnly={false}
          ghost
          onChange={(newValue) => mutation.mutate(newValue)}
        />
      </div>
    </div>
  );
}
