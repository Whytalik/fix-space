"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Download } from "lucide-react";
import type { PropertyResponseDto } from "@fixspace/domain";
import { ModalShell } from "@/components/ui/overlays/modal-shell";
import { Button } from "@/components/ui/primitives/actions/button";
import { CheckboxInput } from "@/components/ui/primitives/inputs/checkbox-input";
import { getProperties } from "@/lib/api/property";
import { downloadExportCsv } from "@/lib/api/import-export";
import { queryKeys } from "@/lib/api/query-keys";
import { useTranslations } from "next-intl";

interface ExportCsvButtonProps {
  databaseId: string;
  activeViewId?: string;
  activeFiltersCount?: number;
  className?: string;
}

const EXPORTABLE_TYPES = new Set(["TEXT", "NUMBER", "DATE", "CHECKBOX", "DURATION", "SELECT", "STATUS", "RATING", "PROGRESS"]);

export function ExportCsvButton({ databaseId, activeViewId, activeFiltersCount = 0, className }: ExportCsvButtonProps) {
  const t = useTranslations("ExportCsvButton");
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <Button
        variant="secondary"
        size="sm"
        leftIcon={<Download size={14} />}
        onClick={() => setIsModalOpen(true)}
        className={className ?? ""}
      >
        {t("label")}
      </Button>
      <ExportCsvModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        databaseId={databaseId}
        activeViewId={activeViewId}
        activeFiltersCount={activeFiltersCount}
      />
    </>
  );
}

interface ExportCsvModalProps {
  isOpen: boolean;
  onClose: () => void;
  databaseId: string;
  activeViewId?: string;
  activeFiltersCount?: number;
}

function ExportCsvModal({ isOpen, onClose, databaseId, activeViewId, activeFiltersCount = 0 }: ExportCsvModalProps) {
  const t = useTranslations("ExportCsvButton");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [includeMetaFields, setIncludeMetaFields] = useState(true);
  const [exportAll, setExportAll] = useState(true);
  const [useActiveFilters, setUseActiveFilters] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { data: properties = [], isPending } = useQuery<PropertyResponseDto[]>({
    queryKey: queryKeys.properties.all(databaseId),
    queryFn: () => getProperties(databaseId),
    enabled: isOpen,
  });

  const exportableProperties = properties.filter((property) => EXPORTABLE_TYPES.has(property.type));

  const toggleProperty = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleExport = async () => {
    setIsExporting(true);
    setError(null);
    try {
      const ids = exportAll ? undefined : [...selectedIds];
      const viewId = useActiveFilters && activeViewId ? activeViewId : undefined;
      await downloadExportCsv(databaseId, ids, includeMetaFields, viewId);
      onClose();
    } catch {
      setError(t("errorExport"));
    } finally {
      setIsExporting(false);
    }
  };

  const footer = (
    <div className="flex justify-between items-center">
      <Button variant="secondary" onClick={onClose}>
        {t("cancel")}
      </Button>
      <Button
        variant="primary"
        loading={isExporting}
        disabled={!exportAll && selectedIds.size === 0}
        leftIcon={<Download size={14} />}
        onClick={handleExport}
      >
        {t("export")}
      </Button>
    </div>
  );

  return (
    <ModalShell isOpen={isOpen} onClose={onClose} title={t("title")} size="sm" footer={footer}>
      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-3">
          <p className="type-form-label text-ink">{t("properties")}</p>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="radio" name="exportScope" checked={exportAll} onChange={() => setExportAll(true)} className="accent-accent" />
            <span className="type-form-label text-ink">{t("allProperties")}</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="radio" name="exportScope" checked={!exportAll} onChange={() => setExportAll(false)} className="accent-accent" />
            <span className="type-form-label text-ink">{t("selectProperties")}</span>
          </label>

          {!exportAll && (
            <div className="ml-5 flex flex-col gap-2 max-h-48 overflow-y-auto">
              {isPending && <p className="type-hint text-ink-muted">{t("loading")}</p>}
              {exportableProperties.map((property) => (
                <CheckboxInput
                  key={property.id}
                  checked={selectedIds.has(property.id)}
                  onChange={() => toggleProperty(property.id)}
                  label={`${property.name} (${property.type.toLowerCase()})`}
                />
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-2 border-t border-stroke pt-4">
          <p className="type-form-label text-ink">{t("metaFields")}</p>
          <CheckboxInput checked={includeMetaFields} onChange={setIncludeMetaFields} label={t("metaFieldsLabel")} />
        </div>

        {activeFiltersCount > 0 && activeViewId && (
          <div className="flex flex-col gap-2 border-t border-stroke pt-4">
            <p className="type-form-label text-ink">{t("records")}</p>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="exportRecords"
                checked={!useActiveFilters}
                onChange={() => setUseActiveFilters(false)}
                className="accent-accent"
              />
              <span className="type-form-label text-ink">{t("allRecords")}</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="exportRecords"
                checked={useActiveFilters}
                onChange={() => setUseActiveFilters(true)}
                className="accent-accent"
              />
              <span className="type-form-label text-ink">
                {t("filteredOnly")}
                <span className="ml-1 type-hint text-ink-muted">{t("activeFilters", { count: activeFiltersCount })}</span>
              </span>
            </label>
          </div>
        )}

        {error && <p className="type-hint text-error">{error}</p>}
      </div>
    </ModalShell>
  );
}
