"use client";

import { useTranslations } from "next-intl";
import { Upload, FileText, X, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/primitives/actions/button";

interface UploadStepProps {
  file: File | null;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  onFileChange: (file: File | null) => void;
  onDrop: (event: React.DragEvent) => void;
  onNext: () => void;
  isLoading: boolean;
  error: string | null;
}

export function UploadStep({ file, fileInputRef, onFileChange, onDrop, onNext, isLoading, error }: UploadStepProps) {
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
