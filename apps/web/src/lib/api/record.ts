import type { RecordResponseDto } from "@nucleus/domain";
import { apiFetch } from "./client";

export function getRecords(databaseId: string) {
  return apiFetch<RecordResponseDto[]>(`/records?databaseId=${databaseId}`);
}

export function getRecord(recordId: string) {
  return apiFetch<RecordResponseDto>(`/records/${recordId}`);
}
export function createRecord(databaseId: string, data: { name?: string; icon?: string }) {
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
