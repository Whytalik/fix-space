"use client";

import { ExportCsvButton } from "@/components/database/export-csv-button";
import { useTranslations } from "next-intl";

interface EditExportSectionProps {
  databaseId: string;
}

export function EditExportSection({ databaseId }: EditExportSectionProps) {
  const t = useTranslations("DatabaseEdit");

  return (
    <div className="flex flex-col gap-4 max-w-lg">
      <p className="text-sm text-ink-muted">{t("exportDesc")}</p>
      <div className="self-start">
        <ExportCsvButton databaseId={databaseId} />
      </div>
    </div>
  );
}
