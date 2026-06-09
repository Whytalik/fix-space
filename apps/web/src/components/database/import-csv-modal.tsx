"use client";

import { useCallback, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, CheckCircle, ChevronLeft, ChevronRight, FileText, Upload, X } from "lucide-react";
import type { CsvPreviewResponseDto, ImportResultResponseDto, ImportValidateResponseDto, PropertyResponseDto } from "@fixspace/domain";
import { ModalShell } from "@/components/ui/overlays/modal-shell";
import { Button } from "@/components/ui/primitives/actions/button";
import { Combobox } from "@/components/ui/primitives/inputs/combobox";
import { getProperties } from "@/lib/api/property";
import { executeCsvImport, previewCsv, validateCsvImport } from "@/lib/api/import-export";
import { queryKeys } from "@/lib/api/query-keys";
import { useTranslations } from "next-intl";

type Step = "upload" | "mapping" | "summary" | "result";

interface ImportCsvModalProps {
  isOpen: boolean;
  onClose: () => void;
  databaseId: string;
}

const IMPORTABLE_TYPES = new Set(["TEXT", "NUMBER", "DATE", "CHECKBOX", "DURATION", "SELECT", "STATUS", "RATING", "PROGRESS"]);

export function ImportCsvModal({ isOpen, onClose, databaseId }: ImportCsvModalProps) {
  const t = useTranslations("ImportCsvModal");
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState<Step>("upload");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<CsvPreviewResponseDto | null>(null);
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [validation, setValidation] = useState<ImportValidateResponseDto | null>(null);
  const [result, setResult] = useState<ImportResultResponseDto | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [limitAction, setLimitAction] = useState<"first" | "cancel">("first");

  const { data: properties = [] } = useQuery<PropertyResponseDto[]>({
    queryKey: queryKeys.properties.all(databaseId),
    queryFn: () => getProperties(databaseId),
    enabled: isOpen,
  });

  const importableProperties = properties.filter((property) => IMPORTABLE_TYPES.has(property.type));

  const handleClose = useCallback(() => {
    setStep("upload");
    setFile(null);
    setPreview(null);
    setMapping({});
    setValidation(null);
    setResult(null);
    setError(null);
    onClose();
  }, [onClose]);

  const handleFileChange = useCallback((selectedFile: File | null) => {
    if (!selectedFile) return;
    setFile(selectedFile);
    setError(null);
  }, []);

  const handleDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      const dropped = event.dataTransfer.files[0];
      if (dropped) handleFileChange(dropped);
    },
    [handleFileChange],
  );

  const handlePreview = useCallback(async () => {
    if (!file) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await previewCsv(file, databaseId);
      setPreview(data);
      const initial: Record<string, string> = {};
      data.columns.forEach((column) => {
        const match = importableProperties.find((property) => property.name.toLowerCase() === column.toLowerCase());
        if (match) initial[column] = match.id;
      });
      setMapping(initial);
      setStep("mapping");
    } catch (error) {
      setError(error instanceof Error ? error.message : t("errorReadFile"));
    } finally {
      setIsLoading(false);
    }
  }, [file, databaseId, importableProperties, t]);

  const handleValidate = useCallback(async () => {
    if (!file || !preview) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await validateCsvImport(file, databaseId, mapping);
      setValidation(data);
      setStep("summary");
    } catch (error) {
      setError(error instanceof Error ? error.message : t("errorValidation"));
    } finally {
      setIsLoading(false);
    }
  }, [file, databaseId, mapping, preview, t]);

  const handleImport = useCallback(async () => {
    if (!file || !validation) return;
    setIsLoading(true);
    setError(null);
    try {
      const maxRows = validation.limitWarning && limitAction === "first" ? validation.limitWarning.willImport : undefined;
      const data = await executeCsvImport(file, databaseId, mapping, maxRows);
      setResult(data);
      setStep("result");
      queryClient.invalidateQueries({ queryKey: queryKeys.records.all(databaseId) });
    } catch (error) {
      setError(error instanceof Error ? error.message : t("errorImport"));
    } finally {
      setIsLoading(false);
    }
  }, [file, databaseId, mapping, validation, limitAction, queryClient, t]);

  const titles: Record<Step, string> = {
    upload: t("titleUpload"),
    mapping: t("titleMapping"),
    summary: t("titleSummary"),
    result: t("titleResult"),
  };

  return (
    <ModalShell isOpen={isOpen} onClose={handleClose} title={titles[step]} size="xl">
      {step === "upload" && (
        <UploadStep
          file={file}
          fileInputRef={fileInputRef}
          onFileChange={handleFileChange}
          onDrop={handleDrop}
          onNext={handlePreview}
          isLoading={isLoading}
          error={error}
        />
      )}
      {step === "mapping" && preview && (
        <MappingStep
          preview={preview}
          properties={importableProperties}
          mapping={mapping}
          onMappingChange={setMapping}
          onBack={() => setStep("upload")}
          onNext={handleValidate}
          isLoading={isLoading}
          error={error}
        />
      )}
      {step === "summary" && validation && (
        <SummaryStep
          validation={validation}
          limitAction={limitAction}
          onLimitActionChange={setLimitAction}
          onBack={() => setStep("mapping")}
          onConfirm={handleImport}
          isLoading={isLoading}
          error={error}
        />
      )}
      {step === "result" && result && <ResultStep result={result} onClose={handleClose} />}
    </ModalShell>
  );
}

interface UploadStepProps {
  file: File | null;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  onFileChange: (file: File | null) => void;
  onDrop: (event: React.DragEvent) => void;
  onNext: () => void;
  isLoading: boolean;
  error: string | null;
}

function UploadStep({ file, fileInputRef, onFileChange, onDrop, onNext, isLoading, error }: UploadStepProps) {
  const t = useTranslations("ImportCsvModal");
  return (
    <div className="flex flex-col gap-5">
      <div
        className="relative flex flex-col items-center justify-center gap-3 border-2 border-dashed border-stroke rounded-2xl px-8 py-10 cursor-pointer hover:border-accent transition-colors duration-150"
        onDrop={onDrop}
        onDragOver={(event) => event.preventDefault()}
      >
        <Upload size={24} className="text-ink-muted" />
        {file ? (
          <div className="flex items-center gap-2 text-ink">
            <FileText size={16} />
            <span className="type-form-label">{file.name}</span>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="ml-1"
              onClick={(event) => {
                event.stopPropagation();
                onFileChange(null);
              }}
            >
              <X size={14} />
            </Button>
          </div>
        ) : (
          <>
            <p className="type-form-label text-ink-secondary">{t("dropHint")}</p>
            <p className="type-hint">{t("dropMeta")}</p>
          </>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,text/csv"
          className="absolute inset-0 opacity-0 cursor-pointer"
          onChange={(event) => onFileChange(event.target.files?.[0] ?? null)}
        />
      </div>

      {error && <p className="type-hint text-error">{error}</p>}

      <div className="flex justify-end">
        <Button variant="primary" disabled={!file} loading={isLoading} rightIcon={<ChevronRight size={14} />} onClick={onNext}>
          {t("next")}
        </Button>
      </div>
    </div>
  );
}

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

function MappingStep({ preview, properties, mapping, onMappingChange, onBack, onNext, isLoading, error }: MappingStepProps) {
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

interface SummaryStepProps {
  validation: ImportValidateResponseDto;
  limitAction: "first" | "cancel";
  onLimitActionChange: (value: "first" | "cancel") => void;
  onBack: () => void;
  onConfirm: () => void;
  isLoading: boolean;
  error: string | null;
}

function SummaryStep({ validation, limitAction, onLimitActionChange, onBack, onConfirm, isLoading, error }: SummaryStepProps) {
  const t = useTranslations("ImportCsvModal");
  const { totalRows, validRows, skippedRows, limitWarning } = validation;
  const willImport = limitWarning && limitAction === "first" ? limitWarning.willImport : validRows;

  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-3 gap-3">
        <StatCard label={t("totalRows")} value={totalRows} />
        <StatCard label={t("validRows")} value={validRows} accent />
        <StatCard label={t("skipped")} value={skippedRows.length} warn={skippedRows.length > 0} />
      </div>

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
        <details className="group">
          <summary className="type-hint text-ink-secondary cursor-pointer hover:text-ink transition-colors duration-150">
            {t("skippedDetails", { count: skippedRows.length })}
          </summary>
          <div className="mt-2 max-h-40 overflow-y-auto rounded-xl border border-stroke divide-y divide-stroke">
            {skippedRows.slice(0, 50).map((row) => (
              <div key={row.rowIndex} className="flex gap-3 px-4 py-2">
                <span className="type-hint text-ink-muted shrink-0">
                  {t("rowLabel")} {row.rowIndex}
                </span>
                <span className="type-hint text-error truncate">{row.reason}</span>
              </div>
            ))}
            {skippedRows.length > 50 && (
              <div className="px-4 py-2">
                <span className="type-hint text-ink-muted">{t("andMore", { count: skippedRows.length - 50 })}</span>
              </div>
            )}
          </div>
        </details>
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

function StatCard({ label, value, accent, warn }: { label: string; value: number; accent?: boolean; warn?: boolean }) {
  return (
    <div className="card flex flex-col items-center gap-1 py-4">
      <span className={`text-2xl font-semibold ${accent ? "text-accent" : warn && value > 0 ? "text-warning" : "text-ink"}`}>{value}</span>
      <span className="type-hint text-ink-muted">{label}</span>
    </div>
  );
}

interface ResultStepProps {
  result: ImportResultResponseDto;
  onClose: () => void;
}

function ResultStep({ result, onClose }: ResultStepProps) {
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
          <div className="mt-2 max-h-48 overflow-y-auto rounded-xl border border-stroke divide-y divide-stroke">
            {result.errors.slice(0, 100).map((errorRow) => (
              <div key={errorRow.rowIndex} className="flex gap-3 px-4 py-2">
                <span className="type-hint text-ink-muted shrink-0">
                  {t("rowLabel")} {errorRow.rowIndex}
                </span>
                <span className="type-hint text-error">{errorRow.reason}</span>
              </div>
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
