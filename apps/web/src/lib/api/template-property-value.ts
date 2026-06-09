import type { CreateTemplatePropertyValueDto, TemplatePropertyValueResponseDto, UpdateTemplatePropertyValueDto } from "@fixspace/domain";
import { apiFetch } from "./client";

export function getTemplatePropertyValues(templateId: string) {
  return apiFetch<TemplatePropertyValueResponseDto[]>(`/template-values?templateId=${templateId}`);
}

export function createTemplatePropertyValue(dto: CreateTemplatePropertyValueDto) {
  return apiFetch<TemplatePropertyValueResponseDto>("/template-values", {
    method: "POST",
    body: dto,
  });
}

export function updateTemplatePropertyValue(id: string, dto: UpdateTemplatePropertyValueDto) {
  return apiFetch<TemplatePropertyValueResponseDto>(`/template-values/${id}`, {
    method: "PATCH",
    body: dto,
  });
}

export function deleteTemplatePropertyValue(id: string) {
  return apiFetch(`/template-values/${id}`, {
    method: "DELETE",
  });
}
