"use client";

import { useCallback, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useQuery } from "@tanstack/react-query";
import type {
  CsvPreviewResponseDto,
  ImportResultResponseDto,
  ImportValidateResponseDto,
  PropertyResponseDto,
  TemplateResponseDto,
} from "@fixspace/domain";
import { ModalShell } from "@/components/ui/overlays/modal-shell";
import { getProperties } from "@/lib/api/property";
import { getTemplates } from "@/lib/api/template";
import { executeCsvImport, previewCsv, validateCsvImport } from "@/lib/api/import-export";
import { queryKeys } from "@/lib/api/query-keys";
import { useTranslations } from "next-intl";

import { UploadStep } from "./import-csv/upload-step";
import { MappingStep } from "./import-csv/mapping-step";
import { SummaryStep } from "./import-csv/summary-step";
import { TemplateStep } from "./import-csv/template-step";
import { ResultStep } from "./import-csv/result-step";

type Step = "upload" | "mapping" | "summary" | "template" | "result";

interface ImportCsvModalProps {
  isOpen: boolean;
  onClose: () => void;
  databaseId: string;
}

const IMPORTABLE_TYPES = new Set(["TEXT", "NUMBER", "DATE", "CHECKBOX", "DURATION", "SELECT", "STATUS", "RATING", "PROGRESS"]);

const AUTO_MAPPING_RULES: Record<string, string[]> = {
  __name__: ["позиция", "position", "ticket", "name", "назва", "id", "ticket number"],
  "Entry Date": ["время", "час", "дата", "time", "date", "entry date", "open time", "opened"],
  "Exit Date": ["время2", "close time", "closed", "exit date", "close date"],
  Pair: ["символ", "пара", "symbol", "pair", "instrument", "asset"],
  Direction: ["тип", "type", "side", "order type", "direction", "buy/sell"],
  Quantity: ["объем", "об'єм", "volume", "size", "lots", "quantity", "units"],
  "Entry Price": ["цена", "ціна", "price", "entry price", "open price", "open"],
  "Exit Price": ["exit price", "close price", "close", "closing price"],
  "Initial SL": ["s / l", "sl", "s/l", "stop loss", "стоп лосс", "stop-loss", "initial sl"],
  "Initial TP": ["t / p", "tp", "t/p", "take profit", "тейк profit", "тейк-профіт", "initial tp"],
  Fees: ["комиссия", "комісія", "commission", "fee", "fees", "своп", "swap", "swaps"],
};

export function ImportCsvModal({ isOpen, onClose, databaseId }: ImportCsvModalProps) {
  const t = useTranslations("ImportCsvModal");
  const queryClient = useQueryClient();
  const fileInputReference = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState<Step>("upload");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<CsvPreviewResponseDto | null>(null);
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [validation, setValidation] = useState<ImportValidateResponseDto | null>(null);
  const [result, setResult] = useState<ImportResultResponseDto | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [limitAction, setLimitAction] = useState<"first" | "cancel">("first");
  const [unknownOptionActions, setUnknownOptionActions] = useState<Record<string, "add" | "skip">>({});
  const [partialImport, setPartialImport] = useState(false);
  const [templateId, setTemplateId] = useState<string | null>(null);

  const { data: properties = [] } = useQuery<PropertyResponseDto[]>({
    queryKey: queryKeys.properties.all(databaseId),
    queryFn: () => getProperties(databaseId),
    enabled: isOpen,
  });

  const { data: templates = [] } = useQuery<TemplateResponseDto[]>({
    queryKey: queryKeys.templates.all(databaseId),
    queryFn: () => getTemplates(databaseId),
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
    setTemplateId(null);
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
        const normalizedColumn = column.toLowerCase().trim();

        const exactMatch = importableProperties.find((property) => property.name.toLowerCase() === normalizedColumn);
        if (exactMatch) {
          initial[column] = exactMatch.id;
          return;
        }

        if (AUTO_MAPPING_RULES["__name__"]?.includes(normalizedColumn)) {
          initial[column] = "__name__";
          return;
        }

        for (const [propertyName, synonyms] of Object.entries(AUTO_MAPPING_RULES)) {
          if (propertyName === "__name__") continue;

          if (synonyms.includes(normalizedColumn)) {
            const propertyMatch = importableProperties.find((property) => property.name.toLowerCase() === propertyName.toLowerCase());
            if (propertyMatch) {
              initial[column] = propertyMatch.id;
              return;
            }
          }
        }
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
      const initial: Record<string, "add" | "skip"> = {};
      for (const option of data.unknownOptions ?? []) initial[option.propertyId] = "add";
      setUnknownOptionActions(initial);
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
      const addPropertyIds = Object.entries(unknownOptionActions)
        .filter(([, value]) => value === "add")
        .map(([key]) => key);
      const data = await executeCsvImport(file, databaseId, mapping, maxRows, addPropertyIds, partialImport, templateId ?? undefined);
      setResult(data);
      setStep("result");
      queryClient.invalidateQueries({ queryKey: queryKeys.records.all(databaseId) });
    } catch (error) {
      setError(error instanceof Error ? error.message : t("errorImport"));
    } finally {
      setIsLoading(false);
    }
  }, [file, databaseId, mapping, validation, limitAction, unknownOptionActions, partialImport, templateId, queryClient, t]);

  const titles: Record<Step, string> = {
    upload: t("titleUpload"),
    mapping: t("titleMapping"),
    summary: t("titleSummary"),
    template: t("titleTemplate"),
    result: t("titleResult"),
  };

  return (
    <ModalShell isOpen={isOpen} onClose={handleClose} title={titles[step]} size="xl">
      {step === "upload" && (
        <UploadStep
          file={file}
          fileInputRef={fileInputReference}
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
          unknownOptionActions={unknownOptionActions}
          onUnknownOptionActionChange={(propertyId, action) => setUnknownOptionActions((prev) => ({ ...prev, [propertyId]: action }))}
          partialImport={partialImport}
          onPartialImportChange={setPartialImport}
          onBack={() => setStep("mapping")}
          onConfirm={() => setStep("template")}
          isLoading={isLoading}
          error={error}
        />
      )}
      {step === "template" && (
        <TemplateStep
          templates={templates}
          selectedTemplateId={templateId}
          onSelect={setTemplateId}
          onBack={() => setStep("summary")}
          onConfirm={handleImport}
          isLoading={isLoading}
          error={error}
        />
      )}
      {step === "result" && result && <ResultStep result={result} onClose={handleClose} />}
    </ModalShell>
  );
}
