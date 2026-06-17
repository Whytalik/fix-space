"use client";

import { useState } from "react";
import { Upload, Download } from "lucide-react";
import { ImportCsvModal } from "@/components/database/import-csv-modal";
import { ExportCsvButton } from "@/components/database/export-csv-button";
import { Button } from "@/components/ui/primitives/actions/button";
import { useTranslations } from "next-intl";

interface EditDataSectionProps {
  databaseId: string;
}

export function EditDataSection({ databaseId }: EditDataSectionProps) {
  const t = useTranslations("DatabaseEdit");
  const [isImportOpen, setIsImportOpen] = useState(false);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between px-4 py-3 rounded-xl border border-stroke bg-surface">
        <div className="flex items-center gap-3">
          <Upload size={16} className="text-ink-muted shrink-0" />
          <div className="flex flex-col">
            <span className="type-form-label text-ink">{t("import")}</span>
            <span className="type-hint text-ink-muted">{t("importDesc")}</span>
          </div>
        </div>
        <Button variant="secondary" size="sm" onClick={() => setIsImportOpen(true)}>
          {t("importCsv")}
        </Button>
      </div>

      <div className="flex items-center justify-between px-4 py-3 rounded-xl border border-stroke bg-surface">
        <div className="flex items-center gap-3">
          <Download size={16} className="text-ink-muted shrink-0" />
          <div className="flex flex-col">
            <span className="type-form-label text-ink">{t("export")}</span>
            <span className="type-hint text-ink-muted">{t("exportDesc")}</span>
          </div>
        </div>
        <ExportCsvButton databaseId={databaseId} />
      </div>

      <ImportCsvModal isOpen={isImportOpen} onClose={() => setIsImportOpen(false)} databaseId={databaseId} />
    </div>
  );
}
