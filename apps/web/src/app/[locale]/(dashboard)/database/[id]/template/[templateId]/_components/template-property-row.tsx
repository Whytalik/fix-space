"use client";

import type { PropertyResponseDto } from "@fixspace/domain";
import { PropertyIcon } from "../../../_components/properties/ui/property-icon";
import { Link2 } from "lucide-react";
import { CellValue } from "../../../_components/cell-value";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createTemplatePropertyValue, updateTemplatePropertyValue } from "@/lib/api/template-property-value";
import { queryKeys } from "@/lib/api/query-keys";

interface TemplatePropertyRowProps {
  templateId: string;
  databaseId: string;
  property: PropertyResponseDto;
  value: unknown;
  valueId?: string;
}

export function TemplatePropertyRow({ templateId, property, value, valueId }: TemplatePropertyRowProps) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (newValue: unknown) => {
      if (valueId) {
        return updateTemplatePropertyValue(valueId, { value: newValue });
      }
      return createTemplatePropertyValue({
        templateId,
        propertyId: property.id,
        value: newValue,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.templates.values(templateId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.templates.detail(templateId) });
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
            <span title="Automated by integration" className="flex items-center">
              <Link2 size={12} className="text-accent shrink-0" />
            </span>
          )}
        </div>
      </div>

      <div className="w-px bg-stroke-subtle shrink-0" />

      <div className="flex-1 flex items-center pl-3 min-w-0">
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
