"use client";

import { useTranslations } from "next-intl";
import { CheckCircle } from "lucide-react";
import type { ImportResultResponseDto } from "@fixspace/domain";
import { Button } from "@/components/ui/primitives/actions/button";
import { SkippedRowItem } from "./skipped-row-item";

interface ResultStepProps {
  result: ImportResultResponseDto;
  onClose: () => void;
}

export function ResultStep({ result, onClose }: ResultStepProps) {
  const t = useTranslations("ImportCsvModal");
  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col items-center gap-3 py-4">
        <CheckCircle size={40} className="text-accent" />
        <p className="type-panel-title text-ink">{t("importedSuccess", { count: result.imported })}</p>
        {result.skipped > 0 && <p className="type-hint text-ink-muted">{t("skippedLabel", { count: result.skipped })}</p>}
      </div>

      {result.errors.length > 0 && (
        <details className="group">
          <summary className="type-hint text-ink-secondary cursor-pointer hover:text-ink transition-colors duration-150">
            {t("showSkipped", { count: result.errors.length })}
          </summary>
          <div className="mt-2 max-h-[200px] overflow-y-auto rounded-xl border border-stroke divide-y divide-stroke">
            {result.errors.map((errorRow) => (
              <SkippedRowItem key={errorRow.rowIndex} rowIndex={errorRow.rowIndex} reason={errorRow.reason} rowLabel={t("rowLabel")} />
            ))}
          </div>
        </details>
      )}

      <div className="flex justify-end">
        <Button variant="primary" onClick={onClose}>
          {t("done")}
        </Button>
      </div>
    </div>
  );
}
