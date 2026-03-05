import type {
  DatabaseResponseDto,
  PropertyResponseDto,
  PropertyValueResponseDto,
  RecordResponseDto,
} from "@nucleus/domain";
import { apiFetch } from "./client";

export function getProperties(databaseId: string) {
  return apiFetch<PropertyResponseDto[]>(`/databases/${databaseId}/properties`);
}

export function getRecords(databaseId: string) {
  return apiFetch<RecordResponseDto[]>(`/databases/${databaseId}/records`);
}

export function updateDatabase(
  spaceId: string,
  databaseId: string,
  data: { name?: string; title?: string; icon?: string },
) {
  return apiFetch<DatabaseResponseDto>(`/spaces/${spaceId}/databases/${databaseId}`, {
    method: "PATCH",
    body: data,
  });
}

export function createRecord(databaseId: string, data: { name?: string; icon?: string }) {
  return apiFetch<RecordResponseDto>(`/databases/${databaseId}/records`, { method: "POST", body: data });
}

export function createPropertyValue(recordId: string, data: { propertyId: string; value?: unknown }) {
  return apiFetch<PropertyValueResponseDto>(`/records/${recordId}/values`, { method: "POST", body: data });
}

export function updatePropertyValue(recordId: string, valueId: string, data: { value?: unknown }) {
  return apiFetch<PropertyValueResponseDto>(`/records/${recordId}/values/${valueId}`, {
    method: "PATCH",
    body: data,
  });
}
