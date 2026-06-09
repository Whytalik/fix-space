import type { RecordResponseDto, SpaceSearchResultDto } from "@fixspace/domain";
import { apiFetch } from "./client";

export function getRecords(databaseId: string) {
  return apiFetch<RecordResponseDto[]>(`/records?databaseId=${databaseId}`);
}

export function getRecord(recordId: string) {
  return apiFetch<RecordResponseDto>(`/records/${recordId}`);
}
export function createRecord(databaseId: string, data: { name?: string; icon?: string; templateId?: string | null; viewId?: string }) {
  return apiFetch<RecordResponseDto>(`/records`, { method: "POST", body: { ...data, databaseId } });
}

export function updateRecord(recordId: string, data: { name?: string; icon?: string }) {
  return apiFetch<RecordResponseDto>(`/records/${recordId}`, {
    method: "PATCH",
    body: data,
  });
}

export function deleteRecord(recordId: string) {
  return apiFetch(`/records/${recordId}`, { method: "DELETE" });
}

export function duplicateRecord(recordId: string) {
  return apiFetch<RecordResponseDto>(`/records/${recordId}/duplicate`, { method: "POST" });
}

export function applyTemplateToRecord(recordId: string, templateId: string) {
  return apiFetch<RecordResponseDto>(`/records/${recordId}/apply-template/${templateId}`, { method: "POST" });
}

export function searchRecords(spaceId: string, query: string) {
  return apiFetch<SpaceSearchResultDto[]>(`/records/search?spaceId=${encodeURIComponent(spaceId)}&q=${encodeURIComponent(query)}`);
}
