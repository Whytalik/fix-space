import type { TemplatePropertyValueResponseDto, TemplateResponseDto } from "@fixspace/domain";
import { apiFetch } from "./client";

export function getTemplates(databaseId: string) {
  return apiFetch<TemplateResponseDto[]>(`/templates?databaseId=${databaseId}`);
}

export function getTemplate(id: string) {
  return apiFetch<TemplateResponseDto>(`/templates/${id}`);
}

export function createTemplate(data: {
  databaseId: string;
  name?: string;
  icon?: string;
  isDefault?: boolean;
  position?: number;
}) {
  return apiFetch<TemplateResponseDto>(`/templates`, { method: "POST", body: data });
}

export function updateTemplate(
  id: string,
  data: { name?: string; icon?: string; isDefault?: boolean; position?: number; description?: string },
) {
  return apiFetch<TemplateResponseDto>(`/templates/${id}`, { method: "PATCH", body: data });
}

export function deleteTemplate(id: string) {
  return apiFetch<TemplateResponseDto>(`/templates/${id}`, { method: "DELETE" });
}

export function duplicateTemplate(id: string) {
  return apiFetch<TemplateResponseDto>(`/templates/${id}/duplicate`, { method: "POST" });
}

export function updateTemplatePropertyValue(id: string, data: { value: unknown }) {
  return apiFetch<TemplatePropertyValueResponseDto>(`/template-values/${id}`, {
    method: "PATCH",
    body: data,
  });
}
