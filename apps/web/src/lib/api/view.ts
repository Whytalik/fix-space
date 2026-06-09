import type { CreateViewDto, UpdateViewDto, ViewResponseDto } from "@fixspace/domain";
import { apiFetch } from "./client";

export function getViews(databaseId: string) {
  return apiFetch<ViewResponseDto[]>(`/databases/${databaseId}/views`);
}

export function createView(databaseId: string, data: Partial<CreateViewDto>) {
  return apiFetch<ViewResponseDto>(`/databases/${databaseId}/views`, {
    method: "POST",
    body: { ...data, databaseId },
  });
}

export function updateView(viewId: string, data: UpdateViewDto) {
  return apiFetch<ViewResponseDto>(`/views/${viewId}`, {
    method: "PATCH",
    body: data,
  });
}

export function deleteView(viewId: string) {
  return apiFetch(`/views/${viewId}`, { method: "DELETE" });
}

export function duplicateView(viewId: string) {
  return apiFetch<ViewResponseDto>(`/views/${viewId}/duplicate`, {
    method: "POST",
  });
}
