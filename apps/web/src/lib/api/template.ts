import type { ContentImageResponseDto, CreateTemplateDto, TemplateResponseDto, UpdateTemplateDto } from "@fixspace/domain";
import { apiFetch } from "./client";

export function getTemplates(databaseId: string) {
  return apiFetch<TemplateResponseDto[]>(`/templates?databaseId=${databaseId}`);
}

export function getTemplate(id: string) {
  return apiFetch<TemplateResponseDto>(`/templates/${id}`);
}

export function createTemplate(dto: CreateTemplateDto) {
  return apiFetch<TemplateResponseDto>("/templates", {
    method: "POST",
    body: dto,
  });
}

export function updateTemplate(id: string, dto: UpdateTemplateDto) {
  return apiFetch<TemplateResponseDto>(`/templates/${id}`, {
    method: "PATCH",
    body: dto,
  });
}

export function deleteTemplate(id: string) {
  return apiFetch<TemplateResponseDto>(`/templates/${id}`, {
    method: "DELETE",
  });
}

export function duplicateTemplate(id: string) {
  return apiFetch<TemplateResponseDto>(`/templates/${id}/duplicate`, {
    method: "POST",
  });
}

export function resetTemplate(id: string) {
  return apiFetch<TemplateResponseDto>(`/templates/${id}/reset`, {
    method: "POST",
  });
}

export function uploadTemplateContentImage(id: string, file: File): Promise<ContentImageResponseDto> {
  const form = new FormData();
  form.append("image", file);
  return apiFetch<ContentImageResponseDto>(`/templates/${id}/images`, {
    method: "POST",
    body: form,
  });
}
