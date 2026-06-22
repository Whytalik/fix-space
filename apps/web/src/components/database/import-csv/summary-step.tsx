"use client";

import { useTranslations } from "next-intl";
import { AlertTriangle, ChevronLeft } from "lucide-react";
import type { ImportValidateResponseDto } from "@fixspace/domain";
import { Button } from "@/components/ui/primitives/actions/button";
import { SkippedRowItem } from "./skipped-row-item";

interface SummaryStepProps {
  validation: ImportValidateResponseDto;
  limitAction: "first" | "cancel";
  onLimitActionChange: (value: "first" | "cancel") => void;
  unknownOptionActions: Record<string, "add" | "skip">;
  onUnknownOptionActionChange: (propertyId: string, action: "add" | "skip") => void;
  partialImport: boolean;
  onPartialImportChange: (value: boolean) => void;
  onBack: () => void;
  onConfirm: () => void;
  isLoading: boolean;
  error: string | null;
}

function StatCard({ label, value, accent, warn }: { label: string; value: number; accent?: boolean; warn?: boolean }) {
  return (
    <div className="card flex flex-col items-center gap-1 py-4">
      <span className={`text-2xl font-semibold ${accent ? "text-accent" : warn && value > 0 ? "text-warning" : "text-ink"}`}>{value}</span>
      <span className="type-hint text-ink-muted">{label}</span>
    </div>
  );
}

export function SummaryStep({
  validation,
  limitAction,
  onLimitActionChange,
  unknownOptionActions,
  onUnknownOptionActionChange,
  partialImport,
  onPartialImportChange,
  onBack,
  onConfirm,
  isLoading,
  error,
}: SummaryStepProps) {
  const t = useTranslations("ImportCsvModal");
  const { totalRows, validRows, skippedRows, limitWarning, unknownOptions = [], unknownOptionRowCount = 0 } = validation;

  const addingCount = (unknownOptions ?? []).filter((option) => unknownOptionActions[option.propertyId] === "add").length;
  const effectiveValid = validRows + (addingCount > 0 ? unknownOptionRowCount : 0);
  const willImport = limitWarning && limitAction === "first" ? limitWarning.willImport : effectiveValid;

  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-3 gap-3">
        <StatCard label={t("totalRows")} value={totalRows} />
        <StatCard label={t("validRows")} value={effectiveValid} accent />
        <StatCard
          label={t("skipped")}
          value={skippedRows.length + (addingCount > 0 ? 0 : unknownOptionRowCount)}
          warn={skippedRows.length > 0}
        />
      </div>

      {unknownOptions.length > 0 && (
        <div className="flex flex-col gap-2 rounded-xl border border-stroke overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-2.5 bg-elevated border-b border-stroke">
            <AlertTriangle size={14} className="text-warning shrink-0" />
            <span className="type-form-label text-ink">{t("unknownOptionsTitle", { count: unknownOptionRowCount })}</span>
          </div>
          {unknownOptions.map((option) => (
            <div key={option.propertyId} className="flex flex-col gap-2 px-4 py-3 border-b border-stroke last:border-0">
              <div className="flex items-start gap-2">
                <span className="type-form-label text-ink shrink-0">{option.propertyName}:</span>
                <span className="type-hint text-ink-secondary flex-1">
                  {option.values.map((value, index) => (
                    <span key={value}>
                      <span className="text-accent font-medium">«{value}»</span>
                      {index < option.values.length - 1 ? ", " : ""}
                    </span>
                  ))}
                </span>
              </div>
              <div className="flex gap-4">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name={`unknown-${option.propertyId}`}
                    value="add"
                    checked={(unknownOptionActions[option.propertyId] ?? "add") === "add"}
                    onChange={() => onUnknownOptionActionChange(option.propertyId, "add")}
                    className="accent-accent"
                  />
                  <span className="type-hint text-ink">{t("unknownOptionsAdd")}</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name={`unknown-${option.propertyId}`}
                    value="skip"
                    checked={unknownOptionActions[option.propertyId] === "skip"}
                    onChange={() => onUnknownOptionActionChange(option.propertyId, "skip")}
                    className="accent-accent"
                  />
                  <span className="type-hint text-ink">{t("unknownOptionsSkip", { count: unknownOptionRowCount })}</span>
                </label>
              </div>
            </div>
          ))}
        </div>
      )}

      {limitWarning && (
        <div className="flex flex-col gap-3 p-4 rounded-xl bg-warning-bg border border-stroke">
          <div className="flex items-start gap-3">
            <AlertTriangle size={16} className="text-warning mt-0.5 shrink-0" />
            <p className="type-form-label text-ink">
              {t("limitWarning", {
                current: limitWarning.currentCount,
                limit: limitWarning.limit,
                willImport: limitWarning.willImport,
              })}
            </p>
          </div>
          <div className="flex flex-col gap-2 pl-7">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="limitAction"
                value="first"
                checked={limitAction === "first"}
                onChange={() => onLimitActionChange("first")}
                className="accent-accent"
              />
              <span className="type-form-label text-ink">{t("importFirst", { count: limitWarning.willImport })}</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="limitAction"
                value="cancel"
                checked={limitAction === "cancel"}
                onChange={() => onLimitActionChange("cancel")}
                className="accent-accent"
              />
              <span className="type-form-label text-ink">{t("cancelImport")}</span>
            </label>
          </div>
        </div>
      )}

      {skippedRows.length > 0 && (
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <details className="group flex-1">
              <summary className="type-hint text-ink-secondary cursor-pointer hover:text-ink transition-colors duration-150">
                {t("skippedDetails", { count: skippedRows.length })}
              </summary>
              <div className="mt-2 max-h-[200px] overflow-y-auto rounded-xl border border-stroke divide-y divide-stroke">
                {skippedRows.map((row) => (
                  <SkippedRowItem key={row.rowIndex} rowIndex={row.rowIndex} reason={row.reason} rowLabel={t("rowLabel")} />
                ))}
              </div>
            </details>
          </div>
          <label className="flex items-center gap-2 cursor-pointer pl-1">
            <input
              type="checkbox"
              checked={partialImport}
              onChange={(event) => onPartialImportChange(event.target.checked)}
              className="accent-accent"
            />
            <span className="type-hint text-ink">{t("partialImport")}</span>
          </label>
        </div>
      )}

      {error && <p className="type-hint text-error">{error}</p>}

      <div className="flex justify-between">
        <Button variant="secondary" leftIcon={<ChevronLeft size={14} />} onClick={onBack}>
          {t("back")}
        </Button>
        <Button
          variant="primary"
          loading={isLoading}
          disabled={willImport === 0 || (!!limitWarning && limitAction === "cancel")}
          onClick={onConfirm}
        >
          {t("importButton", { count: willImport })}
        </Button>
      </div>
    </div>
  );
}
