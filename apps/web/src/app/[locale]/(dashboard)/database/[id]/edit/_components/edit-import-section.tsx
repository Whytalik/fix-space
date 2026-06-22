"use client";

import { useState } from "react";
import { Upload } from "lucide-react";
import { ImportCsvModal } from "@/components/database/import-csv-modal";
import { Button } from "@/components/ui/primitives/actions/button";
import { useTranslations } from "next-intl";

interface EditImportSectionProps {
  databaseId: string;
}

export function EditImportSection({ databaseId }: EditImportSectionProps) {
  const t = useTranslations("DatabaseEdit");
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="flex flex-col gap-4 max-w-lg">
      <p className="text-sm text-ink-muted">{t("importDesc")}</p>
      <Button variant="secondary" leftIcon={<Upload size={14} />} onClick={() => setIsOpen(true)} className="self-start">
        {t("importCsv")}
      </Button>
      <ImportCsvModal isOpen={isOpen} onClose={() => setIsOpen(false)} databaseId={databaseId} />
    </div>
  );
}
