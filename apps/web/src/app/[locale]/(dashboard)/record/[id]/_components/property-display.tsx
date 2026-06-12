"use client";

import { PropertyType } from "@fixspace/domain/enums";
import type { PropertyResponseDto } from "@fixspace/domain";
import { PropertyIcon } from "@/app/[locale]/(dashboard)/database/[id]/_components/properties/ui/property-icon";
import { PropertyHint } from "@/app/[locale]/(dashboard)/database/[id]/_components/properties/ui/property-hint";
import { Link2 } from "lucide-react";
import { CellValue } from "@/app/[locale]/(dashboard)/database/[id]/_components/cell-value";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createPropertyValue, updatePropertyValue } from "@/lib/api/property-value";
import { updateRecord } from "@/lib/api/record";
import { queryKeys } from "@/lib/api/query-keys";

interface RecordPropertyRowProps {
  recordId: string;
  property: PropertyResponseDto;
  value: unknown;
  valueId?: string;
}

export function RecordPropertyRow({ recordId, property, value, valueId }: RecordPropertyRowProps) {
  const isNumeric = property.type === PropertyType.NUMBER || property.type === PropertyType.FORMULA;
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (newValue: unknown) => {
      const isPrimary = property.position === 0 && property.type === PropertyType.TEXT;

      if (isPrimary) {
        return updateRecord(recordId, { name: newValue as string });
      }

      if (valueId) {
        return updatePropertyValue(recordId, valueId, { value: newValue });
      } else {
        return createPropertyValue(recordId, { propertyId: property.id, value: newValue });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["records", "detail", recordId] });
      queryClient.invalidateQueries({ queryKey: queryKeys.records.all(property.databaseId) });
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
          onChange={(value) => mutation.mutate(value)}
        />
      </div>
    </div>
  );
}
