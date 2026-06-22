"use client";

import { useTranslations } from "next-intl";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { CsvPreviewResponseDto, PropertyResponseDto } from "@fixspace/domain";
import { Button } from "@/components/ui/primitives/actions/button";
import { Combobox } from "@/components/ui/primitives/inputs/combobox";

interface MappingStepProps {
  preview: CsvPreviewResponseDto;
  properties: PropertyResponseDto[];
  mapping: Record<string, string>;
  onMappingChange: (mapping: Record<string, string>) => void;
  onBack: () => void;
  onNext: () => void;
  isLoading: boolean;
  error: string | null;
}

export function MappingStep({ preview, properties, mapping, onMappingChange, onBack, onNext, isLoading, error }: MappingStepProps) {
  const t = useTranslations("ImportCsvModal");
  const setColumnMapping = (column: string, value: string) => {
    onMappingChange({ ...mapping, [column]: value || "" });
  };

  const columnOptions = [
    { value: "__name__", label: t("recordName") },
    ...properties.map((property) => ({
      value: property.id,
      label: `${property.name} (${property.type.toLowerCase()})`,
    })),
  ];

  return (
    <div className="flex flex-col gap-5">
      <p className="type-hint text-ink-secondary">{t("detected", { count: preview.totalRows })}</p>

      <div className="overflow-x-auto rounded-xl border border-stroke">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-stroke bg-elevated">
              <th className="text-left px-4 py-2 type-field-label text-ink-secondary w-1/3">{t("csvColumn")}</th>
              <th className="text-left px-4 py-2 type-field-label text-ink-secondary">{t("sampleValues")}</th>
              <th className="text-left px-4 py-2 type-field-label text-ink-secondary w-1/3">{t("mapToProperty")}</th>
            </tr>
          </thead>
          <tbody>
            {preview.columns.map((column) => (
              <tr key={column} className="border-b border-stroke last:border-0">
                <td className="px-4 py-2 type-form-label text-ink font-medium">{column}</td>
                <td className="px-4 py-2 type-hint text-ink-muted max-w-[180px] truncate">
                  {preview.previewRows
                    .map((row) => row[column])
                    .filter(Boolean)
                    .slice(0, 3)
                    .join(", ")}
                </td>
                <td className="px-4 py-2">
                  <Combobox
                    value={mapping[column] ?? ""}
                    onChange={(value) => setColumnMapping(column, value)}
                    options={columnOptions}
                    placeholder={t("skip")}
                    nullable
                    size="sm"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {error && <p className="type-hint text-error">{error}</p>}

      <div className="flex justify-between">
        <Button variant="secondary" leftIcon={<ChevronLeft size={14} />} onClick={onBack}>
          {t("back")}
        </Button>
        <Button variant="primary" loading={isLoading} rightIcon={<ChevronRight size={14} />} onClick={onNext}>
          {t("validate")}
        </Button>
      </div>
    </div>
  );
}
