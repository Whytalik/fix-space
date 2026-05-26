import type { PropertyValueResponseDto } from "@fixspace/domain";
import { apiFetch } from "./client";

export function createPropertyValue(recordId: string, data: { propertyId: string; value?: unknown }) {
  return apiFetch<PropertyValueResponseDto>(`/values`, { method: "POST", body: { ...data, recordId } });
}

export function updatePropertyValue(recordId: string, valueId: string, data: { value?: unknown }) {
  return apiFetch<PropertyValueResponseDto>(`/values/${valueId}`, {
    method: "PATCH",
    body: data,
  });
}
