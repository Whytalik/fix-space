import type { CsvPreviewResponseDto, ImportResultResponseDto, ImportValidateResponseDto } from "@fixspace/domain";
import { apiFetch } from "./client";

export function previewCsv(file: File, databaseId: string): Promise<CsvPreviewResponseDto> {
  const form = new FormData();
  form.append("file", file);
  form.append("databaseId", databaseId);
  return apiFetch<CsvPreviewResponseDto>("/import-export/preview", { method: "POST", body: form });
}

export function validateCsvImport(file: File, databaseId: string, mapping: Record<string, string>): Promise<ImportValidateResponseDto> {
  const form = new FormData();
  form.append("file", file);
  form.append("databaseId", databaseId);
  form.append("mapping", JSON.stringify(mapping));
  return apiFetch<ImportValidateResponseDto>("/import-export/validate", { method: "POST", body: form });
}

export function executeCsvImport(
  file: File,
  databaseId: string,
  mapping: Record<string, string>,
  maxRows?: number,
): Promise<ImportResultResponseDto> {
  const form = new FormData();
  form.append("file", file);
  form.append("databaseId", databaseId);
  form.append("mapping", JSON.stringify(mapping));
  if (maxRows !== undefined) form.append("maxRows", String(maxRows));
  return apiFetch<ImportResultResponseDto>("/import-export/import", { method: "POST", body: form });
}

export function getExportCsvUrl(databaseId: string, propertyIds?: string[], includeMetaFields = true, viewId?: string): string {
  const params = new URLSearchParams({ databaseId });
  if (propertyIds?.length) params.set("propertyIds", propertyIds.join(","));
  if (!includeMetaFields) params.set("includeMetaFields", "false");
  if (viewId) params.set("viewId", viewId);
  const base = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:3000";
  return `${base}/import-export/export?${params.toString()}`;
}

export async function downloadExportCsv(
  databaseId: string,
  propertyIds?: string[],
  includeMetaFields = true,
  viewId?: string,
): Promise<void> {
  const params = new URLSearchParams({ databaseId });
  if (propertyIds?.length) params.set("propertyIds", propertyIds.join(","));
  if (!includeMetaFields) params.set("includeMetaFields", "false");
  if (viewId) params.set("viewId", viewId);

  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:3000"}/import-export/export?${params.toString()}`, {
    credentials: "include",
  });

  if (!response.ok) throw new Error("Export failed");

  const blob = await response.blob();
  const disposition = response.headers.get("content-disposition") ?? "";
  const match = disposition.match(/filename="([^"]+)"/);
  const filename = match?.[1] ?? "export.csv";

  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}
